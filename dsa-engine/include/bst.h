#ifndef BST_H
#define BST_H
typedef struct BSTNode {
    int book_id;
    char isbn[20];
    char title[256];
    struct BSTNode* left;
    struct BSTNode* right;
} BSTNode;
typedef struct {
    BSTNode* root;
    int size;
} BST;
BST* create_bst();
void bst_insert(BST* tree, int book_id, const char* isbn, const char* title);
BSTNode* bst_search(BST* tree, int book_id);
void bst_delete(BST* tree, int book_id);
void bst_inorder(BST* tree, BSTNode** result_array, int* size);
BSTNode* bst_min(BST* tree);
BSTNode* bst_max(BST* tree);
int bst_height(BST* tree);
int bst_count(BST* tree);
void destroy_bst(BST* tree);
#endif
