#include <SFML/Graphics.hpp>
#define WIDTH 800
#define HEIGHT 600
#include <iostream>
#include <cmath>
#define print(x) std::cout << x<< "\n"

sf::Vector2f toCartesian(float pX, float pY);
sf::Vector2f toPixels(float x, float y);


float zoom = 0.5f;
sf::Vector2f offset(0.0f, 0.0f);
sf::Vector2f mid((float)WIDTH / 2.0f, (float)HEIGHT / 2.0f);

sf::Vector2f toPixels(float x, float y) {
    sf::Vector2f center(
        mid.x + offset.x,
        mid.y + offset.y
    );

    return sf::Vector2f(
        center.x + x * zoom,
        center.y - y * zoom
    );
}

sf::Vector2f toCartesian(float pX, float pY) {
    sf::Vector2f center(
        mid.x + offset.x,
        mid.y + offset.y
    );

    return sf::Vector2f(
        (pX - center.x) / zoom,
       -(pY - center.y) / zoom
    );
}

template<typename T>
std::string str_vec(T a) {
    return "(" + std::to_string(a.x) + ", " + std::to_string(a.y) + " )";
}

void draw_line(sf::Vector2f P0, sf::Vector2f P1, sf::RenderWindow&window) {
    sf::Vertex line[] =
    {
        sf::Vertex(toPixels(P0.x, P0.y)),
        sf::Vertex(toPixels(P1.x, P1.y))
    };

    window.draw(line, 2, sf::Lines);
}

void draw_coordinates(sf::RenderWindow& window) {
    draw_line(sf::Vector2f(0, 0), sf::Vector2f(  40,   0    ), window);
    draw_line(sf::Vector2f(0, 0), sf::Vector2f(  -40,  0    ), window);
    draw_line(sf::Vector2f(0, 0), sf::Vector2f(   0,   40   ), window);
    draw_line(sf::Vector2f(0, 0), sf::Vector2f(   0,  -40   ), window);
}


int main() {

    sf::RenderWindow window(sf::VideoMode(800, 600), "Rotation Test!");
    sf::Event event; window.setVerticalSyncEnabled(true);

    while (true)
    {
        while (window.pollEvent(event)) {
            // print(event.type);
            bool isEqual = event.type == sf::Event::MouseWheelScrolled;
            if (isEqual) {
                auto mpos = sf::Mouse::getPosition(window);
                
                auto prev_cmpos = toCartesian(mpos.x, mpos.y);

                if (event.mouseWheelScroll.delta > 0) {
                    zoom += 0.1;
                }
                else {
                    zoom -= 0.1;
                }   

                float pX = (float)mpos.x;
                float pY = (float)mpos.y;
                offset.x = -((prev_cmpos.x  * zoom) - pX) - mid.x;
                offset.y = -(-(prev_cmpos.y * zoom) - pY) - mid.y;
                std::cout << str_vec(toCartesian(mpos.x, mpos.y)) << "\t";
                std::cout << str_vec(prev_cmpos) << "\n";

            }
        };
        window.clear();
        draw_coordinates(window);

        window.display();
    }
    


    return 0;
}