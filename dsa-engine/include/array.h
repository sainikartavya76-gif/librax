#ifndef ARRAY_H
#define ARRAY_H
typedef struct {
    int* data;
    int size;
    int capacity;
} DynamicArray;
DynamicArray* create_array(int initial_capacity);
void array_push(DynamicArray* arr, int value);
int array_get(DynamicArray* arr, int index);
void array_set(DynamicArray* arr, int index, int value);
void array_delete(DynamicArray* arr, int index);
void array_resize(DynamicArray* arr);
void destroy_array(DynamicArray* arr);
void array_print(DynamicArray* arr);
#endif
