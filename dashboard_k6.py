import pandas as pd
from dash import Dash, dcc, html, Input, Output
import plotly.express as px
import plotly.graph_objs as go

csv_path = 'resultados/resultado.csv'
df = pd.read_csv(csv_path)

# Convertendo timestamp para datetime
if 'timestamp' in df.columns:
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')

app = Dash(__name__)

# Função para filtrar métricas por nome
def filtrar_metricas(metric_name):
    return df[df['metric_name'] == metric_name]

# KPI taxa de erro média
def calcular_taxa_erro():
    fail_df = filtrar_metricas('http_req_failed')
    if fail_df.empty:
        return 0
    return round(fail_df['metric_value'].mean() * 100, 2)

# KPI total de requisições
def calcular_total_reqs():
    reqs_df = filtrar_metricas('http_reqs')
    if reqs_df.empty:
        return 0
    return int(reqs_df['metric_value'].sum())

# Latência média total
def calcular_latencia_media():
    lat_df = filtrar_metricas('http_req_duration')
    if lat_df.empty:
        return 0
    return round(lat_df['metric_value'].mean(), 2)

# Latência média por endpoint (url)
def latencia_por_endpoint():
    lat_df = filtrar_metricas('http_req_duration')
    if lat_df.empty or 'url' not in lat_df.columns:
        return pd.DataFrame()
    grouped = lat_df.groupby('url')['metric_value'].mean().reset_index()
    grouped = grouped.sort_values('metric_value', ascending=False).head(10)
    return grouped

# Gráfico de códigos HTTP
def grafico_status_http():
    if 'status' not in df.columns:
        return go.Figure()
    status_counts = df['status'].value_counts()
    fig = go.Figure(data=[go.Pie(labels=status_counts.index.astype(str), values=status_counts.values)])
    fig.update_layout(title='Distribuição de Códigos HTTP')
    return fig

# Função para gerar resumo executivo automático
def gerar_resumo():
    resumo = []
    taxa_erro = calcular_taxa_erro()
    total_reqs = calcular_total_reqs()
    lat_media = calcular_latencia_media()
    resumo.append(f"Total de requisições: {total_reqs}")
    resumo.append(f"Taxa média de erro: {taxa_erro}%")
    resumo.append(f"Latência média: {lat_media} ms")

    # Endpoint mais lento
    df_endpoints = latencia_por_endpoint()
    if not df_endpoints.empty:
        pior = df_endpoints.iloc[0]
        resumo.append(f"Endpoint com maior latência média: {pior['url']} ({round(pior['metric_value'],2)} ms)")
    else:
        resumo.append("Dados de endpoint não disponíveis.")

    # Alerta simples
    if taxa_erro > 5:
        resumo.append("⚠️ Atenção: Taxa de erro acima de 5%!")
    if lat_media > 1000:
        resumo.append("⚠️ Atenção: Latência média acima de 1000 ms!")

    return resumo

app.layout = html.Div([
    html.H1('Dashboard de Testes de Desempenho - k6'),

    html.Div([
        html.H2('KPIs'),
        html.Div([
            html.Div([
                html.H3('Taxa de erro total'),
                html.H1(f"{calcular_taxa_erro()}%", style={'color': 'red'}),
            ], style={'width': '30%', 'display': 'inline-block'}),

            html.Div([
                html.H3('Total de requisições'),
                html.H1(f"{calcular_total_reqs()}", style={'color': 'blue'}),
            ], style={'width': '30%', 'display': 'inline-block'}),

            html.Div([
                html.H3('Latência média (ms)'),
                html.H1(f"{calcular_latencia_media()}", style={'color': 'green'}),
            ], style={'width': '30%', 'display': 'inline-block'}),
        ])
    ], style={'marginBottom': 40}),

    html.Div([
        html.H3('Latência ao longo do tempo (http_req_duration)'),
        dcc.Graph(id='latency-graph'),
    ]),

    html.Div([
        html.H3('Taxa de falhas ao longo do tempo (http_req_failed)'),
        dcc.Graph(id='failures-graph'),
    ]),

    html.Div([
        html.H3('Throughput ao longo do tempo (http_reqs)'),
        dcc.Graph(id='throughput-graph'),
    ]),

    html.Div([
        html.H3('Percentis da Latência'),
        dcc.Graph(id='percentis-graph'),
    ]),

    html.Div([
        dcc.Graph(id='http-status-graph'),
    ]),

    html.Div([
        html.H3('Latência média por Endpoint (top 10)'),
        dcc.Graph(id='latency-endpoint-graph'),
    ]),

    html.Div([
        html.H3('Resumo Executivo'),
        html.Ul(id='resumo-executivo'),
    ], style={'marginTop': 50})
])

@app.callback(
    Output('latency-graph', 'figure'),
    Output('failures-graph', 'figure'),
    Output('throughput-graph', 'figure'),
    Output('percentis-graph', 'figure'),
    Output('http-status-graph', 'figure'),
    Output('latency-endpoint-graph', 'figure'),
    Output('resumo-executivo', 'children'),
    Input('latency-graph', 'id')  # Trigger fictício
)
def update_graphs(_):
    latency_df = filtrar_metricas('http_req_duration')
    failures_df = filtrar_metricas('http_req_failed')
    throughput_df = filtrar_metricas('http_reqs')
    p50_df = filtrar_metricas('http_req_duration_p50')
    p75_df = filtrar_metricas('http_req_duration_p75')
    p90_df = filtrar_metricas('http_req_duration_p90')
    p95_df = filtrar_metricas('http_req_duration_p95')
    p99_df = filtrar_metricas('http_req_duration_p99')

    # Gráfico latência
    fig_latency = px.line(
        latency_df,
        x='timestamp',
        y='metric_value',
        labels={'metric_value': 'Tempo (ms)', 'timestamp': 'Timestamp'},
        title='Latência ao longo do tempo'
    )

    # Gráfico falhas
    fig_failures = px.line(
        failures_df,
        x='timestamp',
        y='metric_value',
        labels={'metric_value': 'Taxa de falhas', 'timestamp': 'Timestamp'},
        title='Taxa de falhas ao longo do tempo'
    )

    # Gráfico throughput
    fig_throughput = px.line(
        throughput_df,
        x='timestamp',
        y='metric_value',
        labels={'metric_value': 'Requisições/s', 'timestamp': 'Timestamp'},
        title='Throughput ao longo do tempo'
    )

    # Gráfico percentis combinados
    fig_percentis = go.Figure()
    for df_perc, nome in zip([p50_df, p75_df, p90_df, p95_df, p99_df], ['p50', 'p75', 'p90', 'p95', 'p99']):
        if not df_perc.empty:
            fig_percentis.add_trace(go.Scatter(
                x=df_perc['timestamp'],
                y=df_perc['metric_value'],
                mode='lines',
                name=nome
            ))
    fig_percentis.update_layout(title='Percentis da Latência', xaxis_title='Timestamp', yaxis_title='Tempo (ms)')

    # Gráfico códigos HTTP
    fig_status = grafico_status_http()

    # Gráfico latência por endpoint
    lat_end_df = latencia_por_endpoint()
    if not lat_end_df.empty:
        fig_lat_end = px.bar(lat_end_df, x='url', y='metric_value',
                             labels={'url': 'Endpoint', 'metric_value': 'Latência Média (ms)'},
                             title='Top 10 Endpoints por Latência Média')
    else:
        fig_lat_end = go.Figure()

    resumo = gerar_resumo()
    resumo_list = [html.Li(item) for item in resumo]

    return fig_latency, fig_failures, fig_throughput, fig_percentis, fig_status, fig_lat_end, resumo_list


if __name__ == '__main__':
    app.run(debug=True)
