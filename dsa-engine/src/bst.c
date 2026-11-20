#include "bst.h"
#include <stdlib.h>
#include <string.h>

BST* create_bst() {
    BST* tree = (BST*)malloc(sizeof(BST));
    tree->root = NULL;
    tree->size = 0;
    return tree;
}
static BSTNode* create_node(int book_id, const char* isbn, const char* title) {
    BSTNode* node = (BSTNode*)malloc(sizeof(BSTNode));
    node->book_id = book_id;
    strncpy(node->isbn, isbn, 19); node->isbn[19] = '\0';
    strncpy(node->title, title, 255); node->title[255] = '\0';
    node->left = node->right = NULL;
    return node;
}
static BSTNode* insert_rec(BSTNode* root, int book_id, const char* isbn, const char* title) {
    if (!root) return create_node(book_id, isbn, title);
    if (book_id < root->book_id) root->left = insert_rec(root->left, book_id, isbn, title);
    else if (book_id > root->book_id) root->right = insert_rec(root->right, book_id, isbn, title);
    return root;
}
void bst_insert(BST* tree, int book_id, const char* isbn, const char* title) {
    tree->root = insert_rec(tree->root, book_id, isbn, title);
    tree->size++;
}
static BSTNode* search_rec(BSTNode* root, int book_id) {
    if (!root || root->book_id == book_id) return root;
    if (book_id < root->book_id) return search_rec(root->left, book_id);
    return search_rec(root->right, book_id);
}
BSTNode* bst_search(BST* tree, int book_id) {
    return search_rec(tree->root, book_id);
}
static BSTNode* min_val_node(BSTNode* node) {
    BSTNode* current = node;
    while (current && current->left != NULL) current = current->left;
    return current;
}
static BSTNode* delete_rec(BSTNode* root, int book_id) {
    if (!root) return root;
    if (book_id < root->book_id) root->left = delete_rec(root->left, book_id);
    else if (book_id > root->book_id) root->right = delete_rec(root->right, book_id);
    else {
        if (!root->left) {
            BSTNode* temp = root->right;
            free(root);
            return temp;
        } else if (!root->right) {
            BSTNode* temp = root->left;
            free(root);
            return temp;
        }
        BSTNode* temp = min_val_node(root->right);
        root->book_id = temp->book_id;
        strcpy(root->isbn, temp->isbn);
        strcpy(root->title, temp->title);
        root->right = delete_rec(root->right, temp->book_id);
    }
    return root;
}
void bst_delete(BST* tree, int book_id) {
    tree->root = delete_rec(tree->root, book_id);
    tree->size--;
}
static void inorder_rec(BSTNode* root, BSTNode** arr, int* index) {
    if (root) {
        inorder_rec(root->left, arr, index);
        arr[(*index)++] = root;
        inorder_rec(root->right, arr, index);
    }
}
void bst_inorder(BST* tree, BSTNode** result_array, int* size) {
    int idx = 0;
    inorder_rec(tree->root, result_array, &idx);
    *size = idx;
}
BSTNode* bst_min(BST* tree) { return tree->root ? min_val_node(tree->root) : NULL; }
static BSTNode* max_val_node(BSTNode* node) {
    BSTNode* current = node;
    while(current && current->right != NULL) current = current->right;
    return current;
}
BSTNode* bst_max(BST* tree) { return tree->root ? max_val_node(tree->root) : NULL; }
static int height_rec(BSTNode* node) {
    if (!node) return -1;
    int l = height_rec(node->left);
    int r = height_rec(node->right);
    return (l > r ? l : r) + 1;
}
int bst_height(BST* tree) { return height_rec(tree->root); }
int bst_count(BST* tree) { return tree->size; }
static void destroy_rec(BSTNode* root) {
    if (root) {
        destroy_rec(root->left);
        destroy_rec(root->right);
        free(root);
    }
}
void destroy_bst(BST* tree) {
    destroy_rec(tree->root);
    free(tree);
}
