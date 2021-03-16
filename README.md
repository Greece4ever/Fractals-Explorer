## Fractal Explorer
![Image Demo of Mandelbrot](https://i.imgur.com/zeaHWHQ.png)


GPU accelerated rendering of the following fractals

- [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set)

- [Julia set](https://en.wikipedia.org/wiki/Julia_set)

- [Newton fractal](https://en.wikipedia.org/wiki/Newton_fractal)

 in 3 different ways 
- [**OpenGL**](https://github.com/Greece4ever/Mandelbrot/tree/master/gl) with GLSL 

- [**WebGL**](https://github.com/Greece4ever/Mandelbrot/tree/master/web) with GLSL (sligthly less performant from above due to browser limitations)

- [**OpenCL**](https://github.com/Greece4ever/Mandelbrot/tree/master/cl) with legacy OpenGL (Compute in OpenCL, draw in OpenGL)




### Installation

You **don't have to install** anything, you can just go straight to the [Mandelbrot Explorer](https://greece4ever.github.io/Mandelbrot/#) page, which is both Desktop and Mobile friendly, hosted by github pages. 
It is recommended to use a **Chromium** based browser for the best performance.


If you are facing performance issues you could use the native **C++** code which is **way** faster than any browser.

### Compiling

The [**OpenGL**](https://github.com/Greece4ever/Mandelbrot/tree/master/gl) folder is available as one file [` gl_mandel.cpp`](https://github.com/Greece4ever/Mandelbrot/blob/master/gl_mandel.cpp) (which makes no disk reads like the code contained in the folder) can be compiled as such on Ubuntu/Debian based distributions 


```sh
sudo apt-get install g++
sudo apt-get install libsfml-dev # SFML
sudo apt-get install libglew-dev # GLEW.H

git clone https://github.com/Greece4ever/Mandelbrot.git && cd Mandelbrot
g++ -std=c++17 -c gl_mandel.cpp && g++ gl_mandel.o -o gl_mandel.out -lsfml-graphics -lsfml-window -lsfml-system -lGL -lGLEW && rm gl_mandel.o 

# Run
./gl_mandel.out
```
To build with another compiler on a custom operating system the required packages are [SFML](https://www.sfml-dev.org/) and [GLEW](http://glew.sourceforge.net/). 

- Output (OpenGL with glsl)

![OpenGL Demo](https://i.imgur.com/iE2eGAR.png)

Similarly the [**OpenCL**](https://github.com/Greece4ever/Mandelbrot/tree/master/cl) folder is contained in [`cl_mandel.cpp`](https://github.com/Greece4ever/Mandelbrot/blob/master/cl_mandel.cpp)
 
```
sudo apt-get install g++
sudo apt-get install libsfml-dev # SFML

# OpenCL
sudo apt install ocl-icd-libopencl1
sudo apt install opencl-headers

# Compile and run (sudo is required sometimes for libOpenCL.so)
g++ cl_mandel.cpp -o a.out -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio -lsfml-network -lOpenCL -lGL && sudo ./a.out
```

And the output should be 

![OpenCL Demo](https://i.imgur.com/LHTypBB.png)


### Usage (OpenGL with glsl)

```sh
./gl_mandel.out --no_text # Hide FPS and zoom depth
./gl_mandel.out --no_vsync # disable VSYNC, more FPS
./gl_mandel.out --no_cur  # disable zoom into cursor
```
