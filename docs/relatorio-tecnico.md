# Relatório Técnico - Teste de Desempenho API Recarga Web Empresa1

Este documento detalha os testes realizados para avaliar o comportamento do endpoint sob carga.

## Cenário
- Endpoint: https://teste.empresa1.com.br:8444/server-sigom/rest/usuariocartao/{id}
- Dois usuários distintos com tokens diferentes.
- Simulação de 20 e 30 usuários simultâneos por 5 minutos.

## Resultados
- Tempo médio de resposta
- Porcentagem de requisições com status 200
- Comportamento sob carga

## Conclusão
O endpoint mostrou estabilidade durante o teste com pequenos picos de latência.