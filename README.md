# Teste de Desempenho API Recarga Web Empresa1

## Visão Geral
Projeto para testar a performance do endpoint da API de recarga web para dois usuários com tokens distintos.

## Pré-requisitos
- k6 instalado (https://k6.io/docs/getting-started/installation/)
- Windows, Linux ou Mac

## Como Executar
1. Clone o repositório
2. Execute o teste:
```
k6 run scripts/teste_tokens_k6.js
```
3. Analise os resultados no arquivo CSV em `resultados/`
4. Abra `graficos/template_graficos_excel.xlsx` para visualizar gráficos

## Próximos Passos
- Migrar para ambiente com Docker, InfluxDB e Grafana para dashboards avançados.
- Automatizar disparo e coleta de métricas.