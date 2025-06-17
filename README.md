# Teste de Desempenho API Recarga Web Empresa1

## Visão Geral
Projeto para testar a performance do endpoint da API de recarga web para dois usuários com tokens distintos.

## Pré-requisitos
- k6 instalado (https://k6.io/docs/getting-started/installation/)
- Windows, Linux ou Mac

Se não tiver instalado

# 1. Preparar ambiente
Instale o k6:

Windows: baixe o instalador [aqui](https://github.com/grafana/k6/releases/tag/v1.0.0)

Linux: use o gerenciador de pacotes (ex: sudo apt install k6 no Ubuntu)

MacOS: brew install k6

Confirme que o k6 está instalado abrindo o terminal/prompt e rodando: k6 version

2. Abra o terminal na pasta do projeto
Vá até a pasta onde você descompactou o ZIP do projeto.

Exemplo (Windows):
cd C:\Users\SeuUsuario\Downloads\teste-desempenho-api-recarga-web-empresa1


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
