cmake_minimum_required(VERSION 3.10)
project(LibraxDSA C)

set(CMAKE_C_STANDARD 99)
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -O2 -Wall -Wextra")

include_directories(include)

file(GLOB SRC_FILES "src/*.c")

add_library(librax_dsa SHARED ${SRC_FILES})

add_executable(test_all tests/test_all.c)
target_link_libraries(test_all librax_dsa)
