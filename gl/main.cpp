#include <GL/glew.h>
#include <SFML/Graphics.hpp>
#include "compile_shaders.h"
#define TRIANGLE_VERTICES 3
#define GLT_IMPLEMENTATION
#include "gltext.h"

int ALGO = 0;  
bool showFPS = true;
bool cur     = true;
bool vsync   = true;


#include "controls.hpp"


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

    GLuint program = createProgram(readf("../web/vertex.glsl"), readf("../web/fragment.glsl"));
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
