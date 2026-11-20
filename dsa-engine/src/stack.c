#include "stack.h"
#include <stdlib.h>
#include <string.h>

Stack* create_stack(int capacity) {
    Stack* stack = (Stack*)malloc(sizeof(Stack));
    stack->data = (StackNode*)malloc(sizeof(StackNode) * capacity);
    stack->top = -1;
    stack->capacity = capacity;
    return stack;
}
void stack_push(Stack* stack, int value, int operation_type, const char* description) {
    if (stack_is_full(stack)) return;
    stack->top++;
    stack->data[stack->top].value = value;
    stack->data[stack->top].operation_type = operation_type;
    strncpy(stack->data[stack->top].description, description, 255);
    stack->data[stack->top].description[255] = '\0';
}
StackNode stack_pop(Stack* stack) {
    StackNode empty = {-1, -1, ""};
    if (stack_is_empty(stack)) return empty;
    return stack->data[stack->top--];
}
StackNode stack_peek(Stack* stack) {
    StackNode empty = {-1, -1, ""};
    if (stack_is_empty(stack)) return empty;
    return stack->data[stack->top];
}
int stack_is_empty(Stack* stack) { return stack->top == -1; }
int stack_is_full(Stack* stack) { return stack->top == stack->capacity - 1; }
int stack_size(Stack* stack) { return stack->top + 1; }
void destroy_stack(Stack* stack) {
    free(stack->data);
    free(stack);
}
