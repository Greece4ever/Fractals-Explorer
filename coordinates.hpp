/*
    CPU implementation of all coordinate transformations 
    in 2D Space (ie Cartesian Coordinate mapping, offsets, zoom)
*/

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


float dist2d(float x0, float x1) {
    if (x1 > x0) 
        return abs(x1 - x0);
    else
        return -abs(x1 - x0);
}

float DistY(float y0, float y1) {
    if (y0 > y1) 
        return -abs(y1 - y0);
    else
        return abs(y1 - y0);
}

float dist(float x_0, float x_1) {
    if (x_1 > x_0)
        return -abs(x_1 - x_0);
    else // x_0 > x_1
        return +abs(x_1 - x_0);
}

bool inRange(int start, int end, int x) {
    bool b1 = x >= start;
    bool b2 = x <= end;
    return b1 && b2;
}
