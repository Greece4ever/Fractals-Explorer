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

You **don't have to install** anything, you can just go straight to the [Fractal Explorer](https://greece4ever.github.io/Fractals-Explorer/) page, which is both Desktop and Mobile friendly, hosted by github pages. 
It is recommended to use a **Chromium** based browser for the best performance.

You could also use the **native C/C++ code** which is way **faster**. 


### Compiling

There are three files you can compile

- [`gl_mandel.cpp`](https://github.com/Greece4ever/Fractals-Explorer/blob/master/gl_mandel.cpp) (**OpenGL** rendering of th Mandelbrot set, minified from [here](https://github.com/Greece4ever/Fractals-Explorer/tree/master/gl) )

- [`cl_mandel.cpp`](https://github.com/Greece4ever/Fractals-Explorer/blob/master/cl_mandel.cpp) (**OpenCL and OpenGL** rendering of the Mandelbrot set, minifed from [here](https://github.com/Greece4ever/Fractals-Explorer/tree/master/cl) )

- [`newton_software.cpp`](https://github.com/Greece4ever/Fractals-Explorer/blob/master/newton_software.cpp) (**Software rendering** of the Newton Fractal)

On `Ubuntu/Debian` to compile you can run

```bash
sudo apt-get install bash
sudo bash install
```
This will install all the dev-header dependencies with `apt-get` and will compile with `g++`/`clang`. This will move the three files listed above to a directory called `build/`

If you want to compile and link on a different compiler and/or operating system the depndenices are 

- [SFML](https://www.sfml-dev.org/download.php)

- [GLEW](http://glew.sourceforge.net/)

- [OpenCL headers](https://github.com/KhronosGroup/OpenCL-Headers)




### Usage 

- `gl_mandel.out`

```sh
./gl_mandel.out --no_text # Hide FPS and zoom depth
./gl_mandel.out --no_vsync # disable VSYNC, more FPS
./gl_mandel.out --no_cur  # disable zoom into cursor
```
