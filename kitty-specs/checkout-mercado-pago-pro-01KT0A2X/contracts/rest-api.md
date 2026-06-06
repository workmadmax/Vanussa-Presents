# REST API Contract: Checkout Mercado Pago Pro

## POST /api/checkout/payment/

**Auth**: Required

### Request

```json
{
	"order_id": "string"
}
```

### Success Response (201)

```json
{
	"init_point": "https://www.mercadopago.com/...",
	"preference_id": "string"
}
```

### Error Responses

- 400: Validation errors (missing fields, invalid address, missing consent)
- 401: Not authenticated
- 404: Order not found or not owned by customer

## POST /api/checkout/webhook/

**Auth**: Public endpoint with signature validation

### Headers

- `MP-Signature`: Provider signature header

### Request

Provider notification payload (raw JSON). The handler must verify the signature
and then confirm payment status with the provider before updating orders.

### Success Response (200)

```json
{
	"status": "ok"
}
```

### Error Responses

- 400: Invalid or missing signature
- 404: Order not found

## Order Status Views

Order list and detail endpoints must surface the PROCESSING state with the
label "Processando" for customers.
