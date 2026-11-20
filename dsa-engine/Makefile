CC = gcc
CFLAGS = -O2 -Wall -Wextra -fPIC
LDFLAGS = -shared

SRC_DIR = src
INC_DIR = include
TEST_DIR = tests

SRCS = $(wildcard $(SRC_DIR)/*.c)
OBJS = $(SRCS:.c=.o)

ifeq ($(OS),Windows_NT)
    LIB_NAME = librax_dsa.dll
    TEST_BIN = test_all.exe
    CLEAN_CMD = cmd /c "del /f /q src\*.o $(LIB_NAME) $(TEST_BIN) 2>nul || exit 0"
else
    LIB_NAME = librax_dsa.so
    TEST_BIN = test_all
    CLEAN_CMD = rm -f $(SRC_DIR)/*.o $(LIB_NAME) $(TEST_BIN)
endif

all: lib test

lib: $(LIB_NAME)

$(LIB_NAME): $(OBJS)
	$(CC) $(CFLAGS) -I$(INC_DIR) $(LDFLAGS) -o $@ $^

$(SRC_DIR)/%.o: $(SRC_DIR)/%.c
	$(CC) $(CFLAGS) -I$(INC_DIR) -c $< -o $@

test: $(TEST_BIN)

$(TEST_BIN): $(TEST_DIR)/test_all.c $(SRCS)
	$(CC) -O2 -Wall -I$(INC_DIR) $^ -o $@

clean:
	-$(CLEAN_CMD)

.PHONY: all lib test clean
