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
