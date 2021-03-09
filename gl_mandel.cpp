/* The shader OpenGL way of doing things, in just one file
   To Build:
        g++ -std=c++17 -c gl_mandel.cpp && g++ $gl_mandel.o -o a.out -lsfml-graphics -lsfml-window -lsfml-system -lGL -lGLEW && rm $file.o 
   To Run:
        ./a.out
 */

#include <GL/glew.h>
#include <SFML/Graphics.hpp>

#ifndef __glew_h__
    #include <GL/glew.h>
#endif
#ifndef _GLIBCXX_STRING
    #include <string>
#endif
#ifndef EXIT_FAILURE
    #define EXIT_FAILURE 1
#endif
#include <iostream>
#ifndef __PRODUCTION__
    std::string get_err() {
        GLenum err = glGetError();
        if (err != GL_NO_ERROR) {
            std::string ERROR = "\033[1;32m" + (std::string)"[Error " + std::to_string(err) + "]";
            return ERROR;
        }
        std::string suc = "\033[1;32m" + (std::string)"[Sucess] " + (std::string)"\033[0m";
        return suc;
    }
    #define glCall() std::cout << get_err() << " File " << "\033[1;32m" << "\"" << __FILE__ << "\"" << "\033[0m" << " at line " << "\033[1;35m" << __LINE__ << "\033[0m" << "\n";
#endif
#include <fstream>  
#include <string.h>

GLuint compileShader(GLuint type, std::string& src) 
{
    GLuint s_id = glCreateShader(type);
    const GLchar* source = src.c_str();
    glShaderSource(s_id, 1, &source, NULL);
    glCompileShader(s_id);

    // See if compilation went OK
    GLint isCompiled = 0;
    glGetShaderiv(s_id, GL_COMPILE_STATUS, &isCompiled);

    if (isCompiled == GL_FALSE) 
    {
        GLint err_length = 0;
        glGetShaderiv(s_id, GL_INFO_LOG_LENGTH, &err_length);
        GLchar* error_string = (GLchar*)malloc(err_length * sizeof(GLchar));
        glGetShaderInfoLog(s_id, err_length, &err_length, error_string);

        printf("%s", error_string);
        
        free(error_string);
        glDeleteShader(s_id);
        exit(EXIT_FAILURE);
    }

    return s_id;
}


GLuint createProgram(std::string vertexShader, std::string fragmentShader)
{
    GLuint program = glCreateProgram();
    GLuint vs = compileShader(GL_VERTEX_SHADER, vertexShader);
    GLuint fs = compileShader(GL_FRAGMENT_SHADER, fragmentShader);

    glAttachShader(program, vs);
    glAttachShader(program, fs);
    glLinkProgram(program);
    glValidateProgram(program);

    // glGetProgramiv(program, GL_VALIDATE_STATUS, )

    //glDetachShader
    glDeleteShader(vs);
    glDeleteShader(fs); 
    
    return program;
}

std::string readf(std::string path) {
    std::ifstream file;
    file.open(path);
    if (!file.is_open()) {
        std::string err = strerror( errno );
        printf("Could not open file \"%s\": %s\n", path.c_str(), err.c_str());
        exit(EXIT_FAILURE);
    }

    std::string buffer;
    std::string line;
    
    while (getline(file, line)) {
        buffer += line + "\n";
    }

    return buffer;
}

#define TRIANGLE_VERTICES 3
#define GLT_IMPLEMENTATION
#include "./gl/gltext.h"

int ALGO = 0;  
bool showFPS = true;
bool cur     = true;
bool vsync   = true;


#ifndef SFML_GRAPHICS_HPP
    #include <SFML/Graphics.hpp>
#endif
#ifndef __glew_h__
    #include <GL/glew.h>
#endif
#ifndef _GLIBCXX_IOSTREAM
    #include <iostream>
#endif
#include <map>
#include <functional>
#include <cmath>

struct velocity
{
    float zoom;
    float move;
};


class c_map {
    void set_mpos(sf::Vector2i new_mpos) {
        mpos.x = new_mpos.x;
        mpos.y = new_mpos.y;
    }

    volatile void doNothing() {}

    public:
        sf::Vector2f mid;
        sf::Vector2f offset;        
        sf::Vector2i mpos;

        GLfloat zoom = 30.0f;
        GLfloat rotation = 0.0f;

        sf::Vector2f res; // width, height (resolution)
        struct velocity speed;

        c_map(GLfloat width, GLfloat height) {
            this->init(width, height);
        }

        c_map() = default;


        void resize(GLfloat width, GLfloat height) {
                res.x = width;
                res.y = height;
            mid.x = width / 2.0f;
            mid.y = height / 2.0f;
        }

        void init(GLfloat width, GLfloat height) {
            this->resize(width, height);
            this->offset.x = 0;
            this->offset.y = 0;
            zoom = 30.0f;
                speed.zoom = 100.0f;
                speed.move = 100.0f;
        }

    template<typename T>
    sf::Vector2f toCartesian(sf::Vector2<T> pixel_pos) {
        float centerX = mid.x - offset.x;
        float centerY = mid.y - offset.y;

        float pX = pixel_pos.x;
        float pY = pixel_pos.y;

        return sf::Vector2f(
             ( pX - centerX) / zoom, 
            -( pY - centerY) / zoom  
        );
    };

    void setOffset(sf::Vector2f prev_cmpos, float pX, float pY) {
        this->offset.x = -(-((prev_cmpos.x   * this->zoom) - pX) - this->mid.x);
        this->offset.y = -(-(-( prev_cmpos.y * this->zoom) - pY) - this->mid.y);
    }

    void ZoomIntoPoint(sf::Vector2i point, float size) { // point is in pixels
        auto prev_cmpos = this->toCartesian(point);
        this->zoom += size;
        if (this->zoom < 0)
            this->zoom = 1;
        this->setOffset(prev_cmpos, point.x, point.y);
    }

};

// prev_cmpos.x = (pixel_pos.x - centerX) / zoom


c_map world;

#include <sstream>   
#include <string>
#include <iomanip>


std::string to_scientic(float x) {
    std::stringstream string_stream;
    string_stream << std::setprecision(1) << std::scientific << x;
    return string_stream.str();
}

std::map<sf::Keyboard::Key, std::function<void(sf::Clock)> > oper = { };

void initMap() {
    oper[sf::Keyboard::D] = [](sf::Clock clock) {world.offset.x += world.speed.move * clock.getElapsedTime().asSeconds(); };
    oper[sf::Keyboard::A] = [](sf::Clock clock) {world.offset.x -= world.speed.move * clock.getElapsedTime().asSeconds(); };
    oper[sf::Keyboard::W] = [](sf::Clock clock) {world.offset.y -= world.speed.move * clock.getElapsedTime().asSeconds(); };
    oper[sf::Keyboard::S] = [](sf::Clock clock) {world.offset.y += world.speed.move * clock.getElapsedTime().asSeconds(); };

    oper[sf::Keyboard::Z] = [](sf::Clock clock) {
        world.ZoomIntoPoint(cur ? world.mpos : sf::Vector2i(world.mid.x, world.mid.y), world.speed.zoom * clock.getElapsedTime().asSeconds());
    };

    oper[sf::Keyboard::X] = [](sf::Clock clock) {
        world.ZoomIntoPoint(cur ? world.mpos : sf::Vector2i(world.mid.x, world.mid.y), -world.speed.zoom * clock.getElapsedTime().asSeconds());
    };

    oper[sf::Keyboard::Q] = [](sf::Clock clock) {world.speed.zoom += 5000 * clock.getElapsedTime().asSeconds(); };
    oper[sf::Keyboard::E] = [](sf::Clock clock) {world.speed.zoom *= 2; };
    oper[sf::Keyboard::R] = [](sf::Clock clock) {world.speed.zoom /= 2; };


    oper[sf::Keyboard::Left] = [](sf::Clock clock)  {world.rotation -= 1.5f * clock.getElapsedTime().asSeconds(); };
    oper[sf::Keyboard::Right] = [](sf::Clock clock) {world.rotation += 1.5f * clock.getElapsedTime().asSeconds(); };
}


void orbitControl(sf::Clock& clock) {
    for (auto i =oper.begin(); i != oper.end(); i++) {
        if(sf::Keyboard::isKeyPressed(i->first)) {
            i->second(clock);
        }
    }
}


std::string FRAGMENT_SHADER = R"glsl(
#version 300 es
precision highp float;

uniform vec2  u_resolution;
uniform vec2  offset; 
uniform float zoom;
uniform float ROTATION;
uniform int   C_ALOGRITHM;

#define width  u_resolution.x
#define height u_resolution.y
#define MATH_PI 3.1415926538

vec2 toCartesian(in vec2 pixel_pos) {
    float centerX = (width  / 2.0)  - offset.x;
    float centerY = (height / 2.0)  + offset.y;

    return vec2(
         (pixel_pos.x - centerX) / zoom, 
        -(pixel_pos.y - centerY) / zoom  
    );
}


vec2 setRotation(vec2 pos) {
    float SIN_ = sin(ROTATION);
    float COS_ = cos(ROTATION);

    float x = pos.x * COS_ - pos.y * SIN_;
    float y = pos.x * SIN_ + pos.y * COS_;
    return vec2(x, y);

}

struct Complex {
    float real;
    float imag;
};

out vec4 FragColor;

void main() {
    vec2 pos = setRotation( toCartesian(gl_FragCoord.xy) );
    float x = pos.x, y = pos.y;

    Complex z;
        z.real = 0.0;
        z.imag = 0.0;
    Complex _z;
        _z.real = 0.0;
        _z.imag = 0.0;

    float a_2, b_2; 

    int iter = 0;
    const int max_iter = 50;

    for (int i=0; i < max_iter; i++) {
        a_2 = _z.real * _z.real;
        b_2 = _z.imag * _z.imag;

        z.real = a_2 - b_2;
        z.imag = 2.0 * _z.real * _z.imag;

        z.real += x;
        z.imag += y;

        _z.real = z.real;
        _z.imag = z.imag;

        if ( (a_2 + b_2) > 4.0) {
            iter = i;
            break;
        }


    }

    float value = float(iter) / float(max_iter);

    switch (C_ALOGRITHM) {
        case 0:
        {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            FragColor = vec4( smooth_ * 0.05, value, smooth_ * value, 1);
            break;
        }
        case 1:
        {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            FragColor = vec4(value / smooth_, 0.0, value, 1);
            break;
        }
        case 2:
        {
            float delta = log2(z.real) * value * exp(b_2 / a_2);
            FragColor = vec4(delta, value, log(delta / (1.0 - delta * value)), 1.0);
            break;

        }
        case 3:
        {
            float sm = pow(log(value * MATH_PI), log2(MATH_PI));
            FragColor = vec4(value *  log2(2.718 * sm),  1.0/sm, value, 1);
            break;
        }
        case 4: {
            FragColor = vec4(0.0, value, 0.0, 1.0);
            break;
        }
        case 5: {
            float smooth_ = float(iter) + 1.0 - log(abs(sqrt(a_2 + b_2))) / log(2.0);
            float smooth_2 = smooth_ + 1.0 - log(smooth_ * abs(sqrt(a_2 + b_2))) / log(2.0);
            float smooth_3 = sin(z.real *  MATH_PI) * log(smooth_ / smooth_2);
            FragColor = vec4(sin(smooth_3), sin(smooth_), cos(smooth_2), 1.0);
            break;
        }
    }
}
)glsl";


std::string VERTEX_SHADER = R"glsl(
#version 300 es

in vec2 pos;

void main() {
    gl_Position = vec4(pos, 0.0, 1.0);
}

)glsl";


void OpenGLInit() {
    glewExperimental = true;
    if (glewInit() != GLEW_OK) {
        printf("Failed to create GLEW context\n");
        exit(EXIT_FAILURE);
    }
}

GLdouble vertices[] = {
        -1.0, -1.0,
         1.0, -1.0,
         1.0,  1.0,

         1.0, 1.0,
        -1.0, 1.0,
       -1.0, -1.0
};


// Uniform Locations
GLint resLocation;
GLint offsetLocation;
GLint zoomLocation;
GLint rotLocation;
GLint algLocation;

void updateUniforms() {
    glUniform2f(resLocation,    world.res.x,    world.res.y);
    glUniform2f(offsetLocation, world.offset.x, world.offset.y);
    glUniform1f(zoomLocation,   world.zoom);
    glUniform1f(rotLocation,    world.rotation); 
    glUniform1i(algLocation,    ALGO);
}


void parseArgv(int argc, char* argv[]) {
    std::map<std::string, bool*> setts = {
        {"--no_text",  &showFPS},
        {"--no_cur",   &cur},
        {"--no_vsync", &vsync}
    };


    for (uint i=1; i < argc; i++) {
        auto pos = setts.find((std::string)argv[i]);
        if (pos == setts.end()) {
            printf("Unrecognised argument \"%s\"\n", argv[i]);
            continue;
        }
        *(pos->second) = false;
    }
}


int main(int argc, char* argv[]) {
    parseArgv(argc, argv);
    initMap();
    world.init(800, 600);

    sf::ContextSettings settings;
        settings.majorVersion = 3;
        settings.minorVersion = 3;
        

    sf::RenderWindow window(sf::VideoMode(world.res.x, world.res.y), "OpenGL", sf::Style::Default, settings);
        OpenGLInit(); 
        if (vsync)
            window.setVerticalSyncEnabled(true);

    sf::Event event;
    bool running = true;

    GLuint program = createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
        glUseProgram(program);

    GLuint VAO;
        glGenVertexArrays(1, &VAO);
        glBindVertexArray(VAO);

    
    GLuint VBO;
        glGenBuffers(1, &VBO);
        glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), (const void*)vertices, GL_STATIC_DRAW);

    
    GLint pos = glGetAttribLocation(program, "pos");    
        glEnableVertexAttribArray(pos);
        glVertexAttribPointer(0, 2, GL_DOUBLE, GL_FALSE, 2 * sizeof(GLdouble), (const void *)0);
    

    resLocation    = glGetUniformLocation(program, "u_resolution");
    offsetLocation = glGetUniformLocation(program, "offset");
    zoomLocation   = glGetUniformLocation(program, "zoom");
    rotLocation    = glGetUniformLocation(program, "ROTATION");
    algLocation    = glGetUniformLocation(program, "C_ALOGRITHM");

    updateUniforms();    
    
    sf::Clock FPS_CLOCK;
    sf::Clock GAME_CLOCK;

    uint frames = 0;

    gltInit();
        GLTtext *FPS_TEXT = gltCreateText();
        gltSetText(FPS_TEXT, "FPS: 0");

    GLTtext *ZOOM_TEXT = gltCreateText();

    sf::Vector2u initial_pos;
    bool isFullScreen = false;
    
    GAME_CLOCK.restart();
    FPS_CLOCK.restart();
    while (running) {
        while (window.pollEvent(event))
        {
            switch (event.type)
            {
                case sf::Event::Closed:
                    running = false;
                    goto END;
                    break;
                case sf::Event::KeyPressed:
                {
                    switch (event.key.code)
                    {
                    case sf::Keyboard::Num1:
                        ALGO = 0;
                        break;
                    case sf::Keyboard::Num2:
                        ALGO = 1;
                        break;
                    case sf::Keyboard::Num3:
                        ALGO = 2;
                        break;
                    case sf::Keyboard::Num4:
                        ALGO = 3;
                        break;
                    case sf::Keyboard::Num5:
                        ALGO = 4;
                        break;
                    case sf::Keyboard::Num6:
                        ALGO = 5;
                        break;
                    case sf::Keyboard::Enter: {
                        world.init(world.res.x, world.res.y);
                    }
                    case sf::Keyboard::F11: {
                        float NEW_WIDTH, NEW_HEIGHT;
                        auto mode = sf::VideoMode::getDesktopMode();
    
                        if (isFullScreen) {
                            window.setSize(sf::Vector2u(initial_pos.x, initial_pos.y));
                            NEW_WIDTH = initial_pos.x;
                            NEW_HEIGHT= initial_pos.y;
                            window.setPosition(sf::Vector2i(mode.width / 2 - (NEW_WIDTH / 2), mode.height / 2 - (NEW_HEIGHT / 2)));

                            isFullScreen = false;
                        } else {
                            initial_pos.x = window.getSize().x;
                            initial_pos.y = window.getSize().y;

                            auto mode = sf::VideoMode::getDesktopMode();
                            NEW_WIDTH  = mode.width;
                            NEW_HEIGHT = mode.height;
                            isFullScreen = true;
                        }
                        

                        window.setSize(sf::Vector2u(NEW_WIDTH, NEW_HEIGHT));
                        glViewport(0, 0, NEW_WIDTH, NEW_HEIGHT);
                        world.resize(NEW_WIDTH, NEW_HEIGHT);
                    }
                    }
                    break;
                }   
                case sf::Event::Resized: {   
                    glViewport(0, 0, event.size.width, event.size.height);
                    world.resize(event.size.width, event.size.height);
                }
            }
            
        }   
        

        glUseProgram(program);
        glBindVertexArray(VAO); // this line is new
        updateUniforms();
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        glDrawArrays(GL_TRIANGLES, 0, 2 * TRIANGLE_VERTICES);

        world.mpos = sf::Mouse::getPosition(window);
        orbitControl(GAME_CLOCK);

        gltSetText(ZOOM_TEXT,  to_scientic(world.zoom).c_str() );
        

        if (showFPS) {
            gltBeginDraw();
                gltColor(1.0f, 1.0f, 1.0f, 1.0f);
                gltDrawText2D(FPS_TEXT, 5.0f, 5.0f, 2.0f);
                gltDrawText2D(ZOOM_TEXT, (world.res.x - world.mid.x) -(gltGetTextWidth(ZOOM_TEXT, 2.0f) / 2), 5.0f, 2.0f); 
            gltEndDraw();


            if (FPS_CLOCK.getElapsedTime().asSeconds() >= 1) {
                std::string fps_string =  "FPS: " + std::to_string(frames);
                gltSetText(FPS_TEXT, fps_string.c_str());
                frames = 0;
                FPS_CLOCK.restart();
            }

        }
        

        frames++;
        window.display();
        GAME_CLOCK.restart();
    }
    END:
        NULL;

    
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
    glDeleteProgram(program);
}


/*
function run () 
{ 
    a=$1;
    file=$(python3 -c "print('${a}'.rsplit('.', 1)[0])");
    g++ -std=c++17 -c $file.cpp && g++ $file.o -o a.out -lsfml-graphics -lsfml-window -lsfml-system -lGL -lGLEW && rm $file.o && ./a.out
}
*/
