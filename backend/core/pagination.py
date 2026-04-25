# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    pagination.py                                      :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mdouglas <mdouglas@student.42sp.org.br>    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/04/25 14:54:02 by mdouglas          #+#    #+#              #
#    Updated: 2026/04/25 14:56:41 by mdouglas         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count' : self.page.paginator.count,
            'total_pages' : self.page.paginator.num_pages,
            'next' : self.get_next_link(),
            'previous' : self.get_previous_link(),
            'results' : data,
        })
    
class LargePagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 150

    def get_paginated_response(self, data):
        return Response({
            'count' : self.page.paginator.count,
            'total_pages' : self.page.paginator.num_pages,
            'next' : self.get_next_link(),
            'previous' : self.get_previous_link(),
            'results' : data,
        })