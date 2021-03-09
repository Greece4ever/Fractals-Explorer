/* The OpenCL way of doing things, all in just one file  
    Compile using:
        g++ cl_mandel.cpp -o a.out -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio -lsfml-network -lOpenCL -lGL 
    Run using:
        sudo ./a.out # libOpenCL.so often requires root access to work
*/

#define DTYPE float
#include <cmath>
#include <string>
#include <CL/cl2.hpp>
#include <iostream>
#ifndef SFML_GRAPHICS_HPP
    #include <SFML/Graphics.hpp>
    #include <SFML/OpenGL.hpp>
#endif

namespace dim {
    int width, height;
}

struct pos
{
    double offsetX = 0;
    double offsetY = 0;
    double zoom = 40;
};



sf::Vector2<float> toPixels(pos position, float x, float y) {
    /* Cartesian cords to pixels */
    float centerX = (dim::width / 2) + position.offsetX;
    float centerY = (dim::height / 2) + position.offsetY;

    return sf::Vector2f(
        centerX + x * position.zoom,
        centerY - y * position.zoom
    );
}

sf::Vector2f toCartesian(pos position, sf::Vector2i mpos) {
    /* pixel cords to cartesian */
    float centerX = (dim::width / 2) + position.offsetX;
    float centerY = (dim::height / 2) + position.offsetY;

    return sf::Vector2f(
        (mpos.x - centerX) / position.zoom,
       -(mpos.y - centerY) / position.zoom        
    );

}


std::string KernelSource = R"cl(
    struct complex {
        double real;
        double imag;
    };


    __constant int columns = $0;
    __constant double initialCenterX = $1;
    __constant double initialCenterY = $2;


    __kernel void mandel(
        __global float *iter,
        __global float *SMOOTH,

        const double offsetX, const double offsetY, 
        const double zoom, const int iterations)
    {
        int col = get_global_id(0);
        int row = get_global_id(1);

        double centerX = initialCenterX + offsetX;
        double centerY = initialCenterY + offsetY;

        double x = (col - centerX) / zoom;
        double y =  -(row - centerY) / zoom;

        struct complex z, _z;
        z.real = 0, _z.real = 0;  
        z.imag = 0; _z.imag = 0;

        float a_2, b_2;
        int local_iterations;

        for (local_iterations=0; local_iterations < iterations; local_iterations++)
        {
            a_2 = _z.real * _z.real;
            b_2 = _z.imag * _z.imag;
            
            z.real = a_2 - b_2;
            z.imag = 2 * _z.real * _z.imag;
            
            z.real += x;
            z.imag += y;

            _z.real = z.real;
            _z.imag = z.imag;

            if (a_2 + b_2 > 4)
                break;
        }

        int tid = row * columns + col;


        float smooth = local_iterations + 1 - log(log(sqrt(a_2 + b_2)) / 2);
        iter[tid] = ((float)local_iterations / (float)iterations);
        SMOOTH[tid] = smooth;
    }
)cl";

void rplc(std::string& str, std::string word, std::string rplcmt) {
	str.replace(str.find(word), sizeof("$1") - 1, rplcmt);
}


std::string loadKernelSource(std::string source_code, std::string width, std::string height, int cord_array[]) {
	if (width.length() > 5 || height.length() > 5)
	{
		printf("Input width and/or height too large to be proccesed.\n");
		exit(1);
	}
	
	int __width  = std::stoi(width.c_str());
	int __height = std::stoi(height.c_str());

	rplc(source_code, "$0", std::to_string(__width));
	rplc(source_code, "$1", std::to_string((double)__width  / 2.0));
	rplc(source_code, "$2", std::to_string((double)__height / 2.0));

	cord_array[0] = __width;
	cord_array[1] = __height;
    delete[] cord_array;

	return source_code;
}


bool inRange(int start, int end, int x) {
    bool b1 = x >= start;
    bool b2 = x <= end;
    return b1 && b2;
}


cl::Device get_device(int platform_index=0, int device_index=0) {
    using std::vector;
    using std::cout;

    vector<cl::Platform> platforms; cl::Platform::get(&platforms);
    if (platforms.size() == 0) {
        cout << ("No Supported OpenCL implementation found");
        exit(1);
    }

    if (!inRange(0, platforms.size(), platform_index)) {
        cout << ("Index \"" + std::to_string(platform_index) + "\" out of Bounds (at Platform selection).");
        exit(1);
    }
    
    cl::Platform selected_platform = platforms[platform_index];
    vector<cl::Device> devices;

    selected_platform.getDevices(CL_DEVICE_TYPE_GPU, &devices);

    if (devices.size() == 0) {
        cout << "Platform \"" << selected_platform.getInfo<CL_PLATFORM_NAME>() << "\" has no supported devices.\n";
        exit(1);
    }

    if (!inRange(0, devices.size(), device_index)) {
        cout << "Out of bounds index for " << "Platform \"" << selected_platform.getInfo<CL_PLATFORM_NAME>() << "";
        exit(1);
    }

    cl::Device default_device = devices[device_index];

    cout << "Using device \"" << default_device.getInfo<CL_DEVICE_NAME>() << "\" by " << default_device.getInfo<CL_DEVICE_VENDOR>() << "\n" ;
    return default_device;
}



int main() {
    // int width = 800, height = 600;
    dim::width  = 800;
    dim::height = 600;

    int SIZE = dim::width * dim::height;
    int BUFFER_SIZE = SIZE * sizeof(DTYPE);


    cl::Device device = get_device(0, 0); // Defalut device 0, 0
    cl::Context context({device});
    cl::CommandQueue queue(context, device);
    
    std::string kernel_source = loadKernelSource(kernel_source, "800", "600", new int[2]);

    cl::Program::Sources sources; sources.push_back({kernel_source.c_str(), kernel_source.length()});
    cl::Program program(context, sources);

    if (program.build({device}) != CL_SUCCESS) {
        std::cout << "Error building: " << program.getBuildInfo<CL_PROGRAM_BUILD_LOG>(device) << std::endl;
        exit(1);
    } else printf("Build success\n");

    DTYPE      CPU_PIXELS[SIZE];
    DTYPE      CPU_COPY_PIXELS[SIZE];
    DTYPE      SMOOTH[SIZE];
    DTYPE      SMOOTH_COPY[SIZE];


    cl::Buffer GPU_PIXELS(context, CL_MEM_READ_WRITE, BUFFER_SIZE);
    cl::Buffer GPU_SMOOTH(context, CL_MEM_READ_WRITE, BUFFER_SIZE);


    queue.enqueueWriteBuffer(GPU_PIXELS, CL_TRUE, 0, BUFFER_SIZE, CPU_PIXELS);
    queue.enqueueWriteBuffer(GPU_SMOOTH, CL_TRUE, 0, BUFFER_SIZE, SMOOTH);

    pos position;
        position.offsetX = 0;
        position.offsetY = 0;
        position.zoom = 40;

    cl::Kernel mandel(program, "mandel");


    sf::RenderWindow window(sf::VideoMode(dim::width, dim::height), "test", sf::Style::Default, sf::ContextSettings(32));
    sf::Event event;

    bool running = true;


    glOrtho(0, dim::width, dim::height, 0, -1, 1);

    float velocity = 1.0f;
    float last_time = 0;
    sf::Clock timer;

    sf::Font font;
    font.loadFromFile("./font.ttf");
    sf::Text text("d", font);
        text.setPosition(10, 10);


    while (running)
    {
        while (window.pollEvent(event)) { if (event.type == sf::Event::Closed) { running = false; } }
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::Q)) {
            velocity += 1.0f;
        }    

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::E)) {
            velocity += 100.0f;
        }


        if (sf::Keyboard::isKeyPressed(sf::Keyboard::Z)) {

            sf::Vector2i mpos =  sf::Mouse::getPosition();
            sf::Vector2f cmpos =  toCartesian(position, mpos);

            position.zoom += velocity;

        } 
        sf::Vector2i mpos =  sf::Mouse::getPosition();
        sf::Vector2f cmpos = toCartesian(position, mpos);
        // printf("%.2f %.2f\n", cmpos.x, cmpos.y);

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::X)) {
            position.zoom -= 1.0f;
        }

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::A)) {
            position.offsetX += 10;
        }

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::D)) {
            position.offsetX -= 10;
        }


        mandel.setArg(0, GPU_PIXELS);           //      __global float *iter,        
        mandel.setArg(1, GPU_SMOOTH);           //      __global float *SMOOTH,
        mandel.setArg(2, position.offsetX);     //     const double offsetX, 
        mandel.setArg(3, position.offsetY);      //     const double offsetY, 
        mandel.setArg(4, position.zoom);        //     const double zoom,
        mandel.setArg(5, 50);                   //     const int iterations)

        queue.enqueueNDRangeKernel(mandel, cl::NullRange, cl::NDRange(dim::width, dim::height), cl::NullRange);
        queue.enqueueReadBuffer(GPU_PIXELS, CL_TRUE, 0, BUFFER_SIZE, CPU_COPY_PIXELS);
        queue.enqueueReadBuffer(GPU_SMOOTH, CL_TRUE, 0, BUFFER_SIZE, SMOOTH_COPY);
        
        glBegin(GL_POINTS);
            for (int i=0; i < dim::height; i++) {
                for (int j=0; j < dim::width; j++) {
                    

                    int tid = i * dim::width + j;
                    float value  = CPU_COPY_PIXELS[tid];
                    float smooth = SMOOTH_COPY[tid];

                    glColor3f(0, value, 0);
                    glVertex2f(j, i);
                }
            }

        glEnd();
        float currentTime = timer.getElapsedTime().asSeconds();
        float fps = 1.0f / (currentTime);
        text.setString(std::to_string(fps));
        // window.draw(text);

        window.display();
        timer.restart();
    }
    return 0;
}

/*
function run () 
{ 
    g++ $1 -o a.out -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio -lsfml-network -lOpenCL -lGL && ./a.out
}
*/

