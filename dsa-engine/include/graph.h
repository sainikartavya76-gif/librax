#ifndef GRAPH_H
#define GRAPH_H
typedef struct Edge {
    int dest_id;
    int weight;
    struct Edge* next;
} Edge;
typedef struct {
    int book_id;
    char title[256];
    Edge* head;
} Vertex;
typedef struct {
    Vertex* vertices;
    int max_vertices;
    int count;
} Graph;
Graph* create_graph(int max_vertices);
void graph_add_vertex(Graph* graph, int book_id, const char* title);
void graph_add_edge(Graph* graph, int src_id, int dest_id, int weight);
void graph_remove_edge(Graph* graph, int src_id, int dest_id);
int* bfs(Graph* graph, int start_id, int* result_size);
int* dfs(Graph* graph, int start_id, int* result_size);
int* graph_neighbors(Graph* graph, int book_id, int* result_size);
int graph_vertex_count(Graph* graph);
int graph_edge_count(Graph* graph);
void destroy_graph(Graph* graph);
#endif
