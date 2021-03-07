#include <SFML/Graphics.hpp>
#define WIDTH 800
#define HEIGHT 600
#include <iostream>
#include <cmath>
#define print(x) std::cout << x<< "\n"

sf::Vector2f cart(sf::Vector2f pos);
sf::Vector2f toCartesian(sf::Vector2f pos);

float ZOOM = 50.0;
sf::Vector2f offset(0, 0);

class Line {
    // sf::Vector2f line[2];
    sf::Vertex line[2];
    sf::Vector2f P0;
    sf::Vector2f P1;


    float radToDeg(float rad) {
        return (180 / 3.14159) * rad;
    }

    public:
        float length;

        Line(sf::Vector2f P0, sf::Vector2f P1) {
            this->P0 = P0; // origin
            this->P1 = P1;
            this->length = getLength();
        }

        Line() = default;

        void render(sf::RenderWindow& window) {
            line[0].position = cart(P0);
            line[1].position = cart(P1);

            window.draw(this->line, 2, sf::Lines);
        }

        float getLength() {
            float x = this->P1.x;
            float y = this->P1.y;

            return sqrt(x * x + y * y);
        }

        void setRotation(float angle) {
            float sin_ = sin( angle );
            float cos_ = cos( angle );
            // printf("%.2f\n", cos_);
            float X = P1.x * cos_ - P1.y * sin_;
            float Y = P1.x * sin_ + P1.y * cos_;

            

            // float y1 = sin(angle) * length;
            // float x1 = cos(angle) * length;
            P1 = sf::Vector2f(X, Y);
        }
};


class Rect {
    Line lines[4];

    public:
        Rect(float x, float y, sf::Vector2f len) {
            lines[0] = Line(sf::Vector2f(x, y), sf::Vector2f(x + len.x, y));
            lines[1] = Line(sf::Vector2f(x + len.x, y), sf::Vector2f(x + len.x, y - len.y));
            lines[2] = Line(sf::Vector2f(x + len.x, y - len.y), sf::Vector2f(x, y - len.y));
            lines[3] = Line(sf::Vector2f(x, y - len.y), sf::Vector2f(x, y));
        }


    void render(sf::RenderWindow& window) {
        for (char i=0; i < 4; i++) {
            lines[i].render(window);
        }
    }

};

sf::Vector2f cart(sf::Vector2f pos) {
    float& x = pos.x;
    float& y = pos.y;
    return sf::Vector2f( (WIDTH / 2 + offset.x) + x * ZOOM, (HEIGHT / 2 + offset.y) - y * ZOOM);
}

// wX = (WIDTH / 2 + offset.x) + x * ZOOM
// wX - (WIDTH / 2 + offset.x) = x * ZOOM

// wY = (HEIGHT / 2 + offset.y) - y * ZOOM
// wY - (HEIGHT / 2 + offset.y) = - y * zoom
// (wY - (HEIGHT / 2 + offset.y)) / ZOOM = -y


sf::Vector2f toCartesian(sf::Vector2f pos) {
    float& wX = pos.x;
    float& wY = pos.y;

    std::cout << "wXY: " << wX << " " << wY << "\n";

    return sf::Vector2f(
        (wX - (WIDTH / 2 + offset.x)) / ZOOM,
       -(wY - (HEIGHT / 2 + offset.y)) / ZOOM
    );
}

// cX = (WIDTH / 2 + offset.x)

// cmpos.x = (wX - (WIDTH / 2 + offset.x)) / ZOOM,

// (cmpos.x * ZOOM) = wX - cX
// (cmpos.x * ZOOM) - wX = -cX
// cX = -((cmpos.x * ZOOM) - wX)
// (WIDTH / 2 + offset.x) = -((cmpos.x * ZOOM) - wX)
// offset.x = -(WIDTH / 2) -((cmpos.x * ZOOM) - wX)


template<typename T>
std::string str_vec(T a) {
    return "(" + std::to_string(a.x) + ", " + std::to_string(a.y) + " )";
}


int main() {

    sf::RenderWindow window(sf::VideoMode(800, 600), "Rotation Test!");
    sf::Event event; window.setVerticalSyncEnabled(true);


    Line line(sf::Vector2f(0, 0), sf::Vector2f(2, 0));


    Rect rect(0, 0, sf::Vector2f(1, 1));

    float rotation = 0;
    float velocity = 0.005f;
    sf::Clock clock;
    while (true)
    {
        while (window.pollEvent(event)) {
            // print(event.type);
            bool isEqual = event.type == sf::Event::MouseWheelScrolled;
            if (isEqual) {
                print("\n--------------------------");

                auto mpos = sf::Mouse::getPosition();
                auto mposf = sf::Vector2f(mpos.x, mpos.y);

                auto cmpos = toCartesian( mposf  );
                
                if (event.mouseWheelScroll.delta > 0) {
                    ZOOM += 5;
                }
                else {
                    ZOOM -= 5;
                }

                auto cmpos2 = toCartesian( mposf );

                std::cout << "Prev: " << str_vec(cmpos) << "\t" << "New: " << str_vec(cmpos2) << "\n";

                float wX = (float)mposf.x;
                float wY = (float)mposf.y;

                // offset.x = (- (( cmpos.x * ZOOM ) - wX) ) - WIDTH / 2;
                // offset.x =  -( (cmpos.x * ZOOM) - wX )    - WIDTH / 2;
                offset.x = -(WIDTH / 2) -((cmpos.x * ZOOM) - wX);
                offset.y = -(-(cmpos.y * ZOOM) - wY) - HEIGHT / 2;

                std::cout << "wX: " << wX << "wY: " << wY << "\n";

                print((wX - (WIDTH / 2 + offset.x)) / ZOOM);

                std::cout << "1 -> " << str_vec(toCartesian(mposf)) << "\n";
                std::cout << "2 -> " << str_vec(toCartesian(sf::Vector2f(sf::Mouse::getPosition().x, sf::Mouse::getPosition().y) ) ) << "\n";
                print("--------------------------\n");


            }
        };
        window.clear();
        line.render(window);
        rect.render(window);

        window.display();
        clock.restart();
    }
    


    return 0;
}