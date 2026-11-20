#include "graph.h"
#include <stdlib.h>
#include <string.h>

Graph* create_graph(int max_vertices) {
    Graph* graph = (Graph*)malloc(sizeof(Graph));
    graph->max_vertices = max_vertices;
    graph->count = 0;
    graph->vertices = (Vertex*)calloc(max_vertices, sizeof(Vertex));
    return graph;
}
static int get_vertex_index(Graph* graph, int book_id) {
    for (int i = 0; i < graph->count; i++) {
        if (graph->vertices[i].book_id == book_id) return i;
    }
    return -1;
}
void graph_add_vertex(Graph* graph, int book_id, const char* title) {
    if (graph->count >= graph->max_vertices) return;
    if (get_vertex_index(graph, book_id) != -1) return;
    graph->vertices[graph->count].book_id = book_id;
    strncpy(graph->vertices[graph->count].title, title, 255);
    graph->vertices[graph->count].title[255] = '\0';
    graph->vertices[graph->count].head = NULL;
    graph->count++;
}
void graph_add_edge(Graph* graph, int src_id, int dest_id, int weight) {
    int src_idx = get_vertex_index(graph, src_id);
    if (src_idx == -1) return;
    Edge* edge = (Edge*)malloc(sizeof(Edge));
    edge->dest_id = dest_id;
    edge->weight = weight;
    edge->next = graph->vertices[src_idx].head;
    graph->vertices[src_idx].head = edge;
}
void graph_remove_edge(Graph* graph, int src_id, int dest_id) {
    int src_idx = get_vertex_index(graph, src_id);
    if(src_idx == -1) return;
    Edge* cur = graph->vertices[src_idx].head;
    Edge* prev = NULL;
    while(cur) {
        if(cur->dest_id == dest_id) {
            if(prev) prev->next = cur->next;
            else graph->vertices[src_idx].head = cur->next;
            free(cur);
            return;
        }
        prev = cur;
        cur = cur->next;
    }
}
int* bfs(Graph* graph, int start_id, int* result_size) {
    int* res = (int*)malloc(sizeof(int) * graph->count);
    *result_size = 0;
    int start_idx = get_vertex_index(graph, start_id);
    if (start_idx == -1) return res;
    int* visited = (int*)calloc(graph->count, sizeof(int));
    int* q = (int*)malloc(sizeof(int) * graph->count);
    int front = 0, rear = 0;
    q[rear++] = start_idx;
    visited[start_idx] = 1;
    while(front < rear) {
        int curr = q[front++];
        res[(*result_size)++] = graph->vertices[curr].book_id;
        Edge* edge = graph->vertices[curr].head;
        while(edge) {
            int n_idx = get_vertex_index(graph, edge->dest_id);
            if(n_idx != -1 && !visited[n_idx]) {
                visited[n_idx] = 1;
                q[rear++] = n_idx;
            }
            edge = edge->next;
        }
    }
    free(visited); free(q);
    return res;
}
int* dfs(Graph* graph, int start_id, int* result_size) {
    int* res = (int*)malloc(sizeof(int) * graph->count);
    *result_size = 0;
    int start_idx = get_vertex_index(graph, start_id);
    if (start_idx == -1) return res;
    int* visited = (int*)calloc(graph->count, sizeof(int));
    int* stack = (int*)malloc(sizeof(int) * graph->count);
    int top = -1;
    stack[++top] = start_idx;
    visited[start_idx] = 1;
    while(top >= 0) {
        int curr = stack[top--];
        res[(*result_size)++] = graph->vertices[curr].book_id;
        Edge* edge = graph->vertices[curr].head;
        while(edge) {
            int n_idx = get_vertex_index(graph, edge->dest_id);
            if(n_idx != -1 && !visited[n_idx]) {
                visited[n_idx] = 1;
                stack[++top] = n_idx;
            }
            edge = edge->next;
        }
    }
    free(visited); free(stack);
    return res;
}
int* graph_neighbors(Graph* graph, int book_id, int* result_size) {
    int src_idx = get_vertex_index(graph, book_id);
    if(src_idx == -1) { *result_size = 0; return NULL; }
    int count = 0;
    Edge* e = graph->vertices[src_idx].head;
    while(e) { count++; e = e->next; }
    int* res = (int*)malloc(sizeof(int) * count);
    e = graph->vertices[src_idx].head;
    *result_size = 0;
    while(e) { res[(*result_size)++] = e->dest_id; e = e->next; }
    return res;
}
int graph_vertex_count(Graph* graph) { return graph->count; }
int graph_edge_count(Graph* graph) {
    int count = 0;
    for(int i=0; i<graph->count; i++) {
        Edge* e = graph->vertices[i].head;
        while(e) { count++; e = e->next; }
    }
    return count;
}
void destroy_graph(Graph* graph) {
    for(int i=0; i<graph->count; i++) {
        Edge* e = graph->vertices[i].head;
        while(e) {
            Edge* temp = e;
            e = e->next;
            free(temp);
        }
    }
    free(graph->vertices);
    free(graph);
}
