#include "array.h"
#include <stdlib.h>
#include <stdio.h>

DynamicArray* create_array(int initial_capacity) {
    DynamicArray* arr = (DynamicArray*)malloc(sizeof(DynamicArray));
    arr->data = (int*)malloc(sizeof(int) * initial_capacity);
    arr->size = 0;
    arr->capacity = initial_capacity;
    return arr;
}
void array_resize(DynamicArray* arr) {
    if (arr->size >= arr->capacity) {
        arr->capacity *= 2;
        arr->data = (int*)realloc(arr->data, sizeof(int) * arr->capacity);
    } else if (arr->size > 0 && arr->size == arr->capacity / 4) {
        arr->capacity /= 2;
        arr->data = (int*)realloc(arr->data, sizeof(int) * arr->capacity);
    }
}
void array_push(DynamicArray* arr, int value) {
    array_resize(arr);
    arr->data[arr->size++] = value;
}
int array_get(DynamicArray* arr, int index) {
    if (index < 0 || index >= arr->size) return -1;
    return arr->data[index];
}
void array_set(DynamicArray* arr, int index, int value) {
    if (index >= 0 && index < arr->size) arr->data[index] = value;
}
void array_delete(DynamicArray* arr, int index) {
    if (index < 0 || index >= arr->size) return;
    for (int i = index; i < arr->size - 1; i++) {
        arr->data[i] = arr->data[i + 1];
    }
    arr->size--;
    array_resize(arr);
}
void destroy_array(DynamicArray* arr) {
    free(arr->data);
    free(arr);
}
void array_print(DynamicArray* arr) {
    for (int i = 0; i < arr->size; i++) {
        printf("%d ", arr->data[i]);
    }
    printf("\n");
}
