#define DTYPE float
#include "argparse.hpp"
#include "compile_sources.hpp"
#include <cmath>

int main() {
    // int width = 800, height = 600;
    dim::width  = 800;
    dim::height = 600;

    int SIZE = dim::width * dim::height;
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
            printf("%.2f\n", velocity);
        }    

        if (sf::Keyboard::isKeyPressed(sf::Keyboard::E)) {
            velocity += 100.0f;
            printf("%.2f\n", velocity);
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

