#ifndef STACK_H
#define STACK_H
typedef struct {
    int value;
    int operation_type;
    char description[256];
} StackNode;
typedef struct {
    StackNode* data;
    int top;
    int capacity;
} Stack;
Stack* create_stack(int capacity);
void stack_push(Stack* stack, int value, int operation_type, const char* description);
StackNode stack_pop(Stack* stack);
StackNode stack_peek(Stack* stack);
int stack_is_empty(Stack* stack);
int stack_is_full(Stack* stack);
int stack_size(Stack* stack);
void destroy_stack(Stack* stack);
#endif
