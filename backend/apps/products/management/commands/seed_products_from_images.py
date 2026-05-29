"""
Management command: seed_products_from_images
=============================================

Coloque em:
    backend/apps/products/management/commands/seed_products_from_images.py

(crie as pastas management/ e commands/ com __init__.py vazios se não existirem)

Estrutura de pastas esperada:
    seeds/
    ├── aneis/
    │   └── anel-prata.webp
    ├── brincos/
    │   └── brinco-perola.webp
    ├── chapeis/
    │   └── chapeu-palha.webp
    ├── colares/
    │   └── colar-ouro.webp
    ├── pingentes/
    │   └── pingente-coracao.webp
    └── pulseiras/
            └── pulseira-couro.webp

O nome da pasta  → Category.name / Category.slug
O nome do arquivo → Product.name / Product.slug (hífens e underscores viram espaços)

Uso:
    # pasta padrão: seeds/ na raiz do backend (BASE_DIR)
  python manage.py seed_products_from_images

  # pasta personalizada
  python manage.py seed_products_from_images --folder /caminho/para/suas/imagens

  # limpar tudo antes de inserir (cuidado: apaga produtos existentes)
  python manage.py seed_products_from_images --clear

  # definir faixa de preço aleatório (padrão: 29.90 a 299.90)
  python manage.py seed_products_from_images --min-price 19.90 --max-price 199.90
"""

import random
import shutil
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.utils.text import slugify

# Descrições genéricas por categoria para deixar os produtos com cara real
DESCRIPTIONS_BY_CATEGORY = {
    "default": [
        "Um presente especial para quem você ama.",
        "Feito com cuidado e atenção aos detalhes.",
        "Perfeito para qualquer ocasião.",
        "Uma escolha elegante e atemporal.",
        "Qualidade e beleza em um só produto.",
    ],
    "decoracao": [
        "Peça decorativa que transforma qualquer ambiente.",
        "Design moderno que combina com qualquer estilo.",
        "Adiciona charme e personalidade ao seu lar.",
        "Peça artesanal com acabamento premium.",
    ],
    "bijuterias": [
        "Joia delicada que valoriza qualquer look.",
        "Acabamento dourado de alta durabilidade.",
        "Design exclusivo para mulheres especiais.",
        "Peça versátil para o dia a dia ou ocasiões especiais.",
    ],
    "kits-presente": [
        "Kit completo pensado com carinho para presentear.",
        "Combinação perfeita de produtos selecionados.",
        "Embalagem elegante inclusa, pronto para presentear.",
        "Conjunto exclusivo para momentos especiais.",
    ],
    "personalizados": [
        "Produto personalizado com nome ou mensagem especial.",
        "Presente único e exclusivo, feito sob medida.",
        "Personalização disponível em até 48 horas.",
        "Um presente que ninguém mais vai ter igual.",
    ],
    "bebes": [
        "Desenvolvido com materiais seguros e certificados.",
        "Ideal para recém-nascidos e bebês até 12 meses.",
        "Presente encantador para a chegada do bebê.",
        "Material hipoalergênico e lavável.",
    ],
}

EXTENSIONS_PERMITIDAS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def get_description(category_slug: str) -> str:
    descriptions = DESCRIPTIONS_BY_CATEGORY.get(
        category_slug, DESCRIPTIONS_BY_CATEGORY["default"]
    )
    return random.choice(descriptions)


def name_from_filename(filename: str) -> str:
    """'vaso-de-ceramica.jpg' → 'Vaso De Ceramica'"""
    stem = Path(filename).stem
    return stem.replace("-", " ").replace("_", " ").title()


class Command(BaseCommand):
    help = "Cadastra produtos no banco a partir de uma pasta de imagens organizadas por categoria."

    def add_arguments(self, parser):
        parser.add_argument(
            "--folder",
            type=str,
            default="seeds",
            help="Caminho para a pasta raiz com subpastas por categoria (padrão: seeds/)",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Remove todos os produtos e categorias antes de inserir (CUIDADO)",
        )
        parser.add_argument(
            "--min-price",
            type=float,
            default=29.90,
            help="Preço mínimo aleatório (padrão: 29.90)",
        )
        parser.add_argument(
            "--max-price",
            type=float,
            default=299.90,
            help="Preço máximo aleatório (padrão: 299.90)",
        )

    def handle(self, *args, **options):
        # Imports dentro do handle para garantir que o Django está pronto
        from apps.categories.models import Category
        from apps.products.models import Product, ProductImage

        folder = Path(options["folder"])
        if not folder.is_absolute():
            folder = Path(settings.BASE_DIR) / folder

        if not folder.exists():
            raise CommandError(
                f"Pasta não encontrada: {folder}\n"
                f"Crie a pasta e coloque subpastas com as imagens dentro."
            )

        if options["clear"]:
            self.stdout.write(
                self.style.WARNING("⚠️  Removendo produtos e categorias existentes...")
            )
            ProductImage.objects.all().delete()
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("   Banco limpo."))

        min_price = Decimal(str(options["min_price"]))
        max_price = Decimal(str(options["max_price"]))

        media_root = settings.MEDIA_ROOT
        if not media_root:
            raise CommandError("MEDIA_ROOT nao configurado em settings.py")

        # Destino das imagens (MEDIA_ROOT/product_images/)
        media_dest = Path(media_root) / "product_images"
        media_dest.mkdir(parents=True, exist_ok=True)

        total_products = 0
        total_images = 0
        skipped = 0

        category_dirs = sorted([d for d in folder.iterdir() if d.is_dir()])

        if not category_dirs:
            raise CommandError(
                f"Nenhuma subpasta encontrada em {folder}.\n"
                f"Crie subpastas com o nome das categorias e coloque as imagens dentro."
            )

        for category_dir in category_dirs:
            category_name = (
                category_dir.name.replace("-", " ").replace("_", " ").title()
            )
            category_slug = slugify(category_dir.name)

            category, created = Category.objects.get_or_create(
                slug=category_slug,
                defaults={"name": category_name},
            )

            if created:
                self.stdout.write(
                    f"\n📁 Categoria criada: {self.style.SUCCESS(category_name)}"
                )
            else:
                self.stdout.write(f"\n📁 Categoria existente: {category_name}")

            image_files = sorted(
                [
                    f
                    for f in category_dir.iterdir()
                    if f.is_file() and f.suffix.lower() in EXTENSIONS_PERMITIDAS
                ]
            )

            if not image_files:
                self.stdout.write(
                    self.style.WARNING(
                        f"   Nenhuma imagem encontrada em {category_dir.name}/"
                    )
                )
                continue

            for image_path in image_files:
                product_name = name_from_filename(image_path.name)
                product_slug = slugify(product_name)

                # Garante slug único se já existir
                base_slug = product_slug
                counter = 1
                while Product.objects.filter(slug=product_slug).exists():
                    product_slug = f"{base_slug}-{counter}"
                    counter += 1

                # Preço aleatório arredondado em .90
                price_int = random.randint(int(min_price), int(max_price))
                price = Decimal(f"{price_int}.90")
                price = max(min_price, min(price, max_price))

                stock = random.randint(5, 50)

                product = Product.objects.create(
                    name=product_name,
                    slug=product_slug,
                    description=get_description(category_slug),
                    price=price,
                    stock=stock,
                    is_active=True,
                    category=category,
                )

                # Copia a imagem para MEDIA_ROOT e vincula ao ProductImage
                dest_filename = f"{product_slug}{image_path.suffix.lower()}"
                dest_path = media_dest / dest_filename

                shutil.copy2(image_path, dest_path)

                with open(dest_path, "rb") as f:
                    ProductImage.objects.create(
                        product=product,
                        image=File(f, name=f"product_images/{dest_filename}"),
                        alt_text=product_name,
                    )

                total_products += 1
                total_images += 1
                self.stdout.write(
                    f"   ✅ {product_name} — R$ {price} — estoque: {stock}"
                )

        self.stdout.write("\n" + "─" * 50)
        self.stdout.write(
            self.style.SUCCESS(
                f"✨ Concluído! {total_products} produtos criados, "
                f"{total_images} imagens cadastradas, {skipped} ignorados."
            )
        )
