#include <CL/cl2.hpp>
#include <iostream>
#define log_msg(x) std::cout << x << "\n"
#define DTYPE float
#include "argparse.hpp"

#include <SFML/Graphics.hpp>
#include <SFML/OpenGL.hpp>
#define random() ((double) rand() / (RAND_MAX))
#include <cmath>

bool inRange(int start, int end, int x) {
    bool b1 = x >= start;
    bool b2 = x <= end;
    return b1 && b2;
}

std::string load_source() {
}

struct pos
{
    double offsetX = 0;
    double offsetY = 0;
    double zoom = 40;
};

sf::Vector2<float> toPixels(pos position, float x, float y) {
    float centerX = (800 / 2) + position.offsetX;
    float centerY = (600 / 2) + position.offsetY;

    return sf::Vector2f(
        centerX + x * position.zoom,
        centerY - y * position.zoom
    );
}

sf::Vector2f toCartesian(pos position, sf::Vector2i mpos) {
    float centerX = (800 / 2) + position.offsetX;
    float centerY = (600 / 2) + position.offsetY;

    return sf::Vector2f(
        (mpos.x - centerX) / position.zoom,
       -(mpos.y - centerY) / position.zoom        
    );

}

// g++ gpu.cpp -o a.out -lOpenCL

cl::Device get_device(int platform_index=0, int device_index=0) {
    using std::vector;
    vector<cl::Platform> platforms; cl::Platform::get(&platforms);
    if (platforms.size() == 0) {
        log_msg("No Supported OpenCL implementation found");
        exit(1);
    }


    if (!inRange(0, platforms.size(), platform_index)) {
        log_msg("Index \"" + std::to_string(platform_index) + "\" out of Bounds (at Platform selection).");
        exit(1);
    }
    
    cl::Platform selected_platform = platforms[platform_index];
    vector<cl::Device> devices;

    selected_platform.getDevices(CL_DEVICE_TYPE_GPU, &devices);

    if (devices.size() == 0) {
        std::cout << "Platform \"" << selected_platform.getInfo<CL_PLATFORM_NAME>() << "\" has no supported devices.\n";
        exit(1);
    }

    if (!inRange(0, devices.size(), device_index)) {
        std::cout << "Out of bounds index for " << "Platform \"" << selected_platform.getInfo<CL_PLATFORM_NAME>() << "";
        exit(1);
    }

    cl::Device default_device = devices[device_index];

    std::cout << "Using device \"" << default_device.getInfo<CL_DEVICE_NAME>() << "\" by " << default_device.getInfo<CL_DEVICE_VENDOR>() << "\n" ;
    return default_device;
}


float dist2d(float x0, float x1) {
    if (x1 > x0) 
        return abs(x1 - x0);
    else
        return -abs(x1 - x0);
}


int main() {
    int width = 800, height = 600;
    int SIZE = width * height;
    int BUFFER_SIZE = SIZE * sizeof(DTYPE);

    cl::Device device = get_device(0, 0);
    cl::Context context({device});
    cl::CommandQueue queue(context, device);
    
    std::string kernel_source = loadKernelSource("mandelbrot.cl", "800", "600", new int[2]);


    cl::Program::Sources sources; sources.push_back({kernel_source.c_str(), kernel_source.length()});
    cl::Program program(context, sources);
    
    if (program.build({device}) != CL_SUCCESS) {
        std::cout << "Error building: " << program.getBuildInfo<CL_PROGRAM_BUILD_LOG>(device) << std::endl;
        exit(1);
    }


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


    sf::RenderWindow window(sf::VideoMode(width, height), "test", sf::Style::Default, sf::ContextSettings(32));
    sf::Event event;

    bool running = true;


    glOrtho(0, width, height, 0, -1, 1);


    while (running)
    {
        while (window.pollEvent(event)) { if (event.type == sf::Event::Closed) { running = false; } }
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::Z)) {

            sf::Vector2i mpos =  sf::Mouse::getPosition();
            sf::Vector2f cmpos =  toCartesian(position, mpos);

            position.zoom += 1.0f;

            sf::Vector2f cmpos_2 =  toCartesian(position, mpos);
            
            position.offsetX += dist2d(cmpos.x, cmpos_2.x) * position.zoom;

            sf::Vector2f cmpos_3 = toCartesian(position, mpos);

            printf("Old: %.2f, New: %.2f, Final: %.2f\n", cmpos.x, cmpos_2.x, cmpos_3.x);

            // position.offsetY += dist2d(cmpos_2.x, cmpos.x) * position.zoom;
            // position.offsetX += dist2d(cmpos_2.y, cmpos.y) * position.zoom;


        } 
        sf::Vector2i mpos =  sf::Mouse::getPosition();
        sf::Vector2f cmpos = toCartesian(position, mpos);
        // printf("%.2f %.2f\n", cmpos.x, cmpos.y);

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::X)) {
            position.zoom -= 1.0f;
        }

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::A)) {
            position.offsetY += 10;
        }

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::D)) {
            position.offsetY -= 10;
        }



        mandel.setArg(0, GPU_PIXELS);
        mandel.setArg(1, GPU_SMOOTH);
        mandel.setArg(2, position.offsetY);
        mandel.setArg(3, position.offsetX);
        mandel.setArg(4, position.zoom);
        mandel.setArg(5, 50);

        queue.enqueueNDRangeKernel(mandel, cl::NullRange, cl::NDRange(width, height), cl::NullRange);
        queue.enqueueReadBuffer(GPU_PIXELS, CL_TRUE, 0, BUFFER_SIZE, CPU_COPY_PIXELS);
        queue.enqueueReadBuffer(GPU_SMOOTH, CL_TRUE, 0, BUFFER_SIZE, SMOOTH_COPY);
        
        glBegin(GL_POINTS);
            for (int i=0; i < height; i++) {
                for (int j=0; j < width; j++) {
                    

                    int tid = i * width + j;
                    float value  = CPU_COPY_PIXELS[tid];
                    float smooth = SMOOTH_COPY[tid];

                    glColor3f(0, value, 0);
                    glVertex2f(j, i);
                }
            }

        glEnd();


        // exit(1);

        window.display();
    }

    return 0;
}