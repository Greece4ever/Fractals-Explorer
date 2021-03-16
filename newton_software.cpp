/*
function run {
    g++ -c -O3 test.cpp &&
    g++ test.o -pthread -lsfml-graphics -lsfml-window -lsfml-system &&
    ./a.out
}

function run2 {
    clang++ -c -O3 test.cpp &&
    clang++ test.o -pthread -lsfml-graphics -lsfml-window -lsfml-system &&
    ./a.out
}

*/

#include <SFML/Graphics.hpp>
#include <complex>
#define WIDTH 800
#define HEIGHT 600
#include <thread>
#include <iostream>

typedef std::complex<float> complexf;
complexf roots[3] = //Roots (solutions) of the polynomial
{
	complexf(1, 0), 
	complexf(-.5, sqrt(3)/2), 
	complexf(-.5, -sqrt(3)/2)
};
	
sf::Color colors[3] =  //Assign a color for each root
{
    sf::Color(154, 93, 93  ),
    sf::Color(109, 167, 109),
    sf::Color(99, 129, 159 )
};  

sf::Vector2f offset(0, 0);
float zoom = 200.0;

std::complex<float>
    toComplex(float x, float y) {
        float centerX = (WIDTH  / 2.0)  - offset.x;
        float centerY = (HEIGHT / 2.0)  + offset.y;
    return std::complex<float>(
         (x - centerX) / zoom, 
        -(y - centerY) / zoom  
    );
}


void newton_iteration(
    complexf& z,
    complexf& a,
    complexf (*p)(std::complex<float>),
    complexf (*p_pr)(std::complex<float>))
{
    z -= a * (p(z) / p_pr(z));
}

complexf f(complexf z) {
    return std::pow(z, 3) - complexf(1, 0);
}

complexf f_p(complexf z ) {
    return complexf(3, 0) * std::pow(z, 2);
}


void 
pixelNewton(uint x, uint y, sf::Image* image, int max_iter=50) {
    complexf z = toComplex(x, y);
    complexf a(1, 0);
    for (uint _=0; _ < max_iter; _++) {
        newton_iteration(z, a, f, f_p);
        for (u_char i=0; i < 3; i++) {
            complexf diff = z - roots[i];
            float tolerance = 0.0000001;
            if ( std::abs(diff.real()) < tolerance && 
                 std::abs(diff.imag()) < tolerance )
            {
                float value = (float)_/(float)max_iter;   
                auto col = sf::Color(colors[i].r, colors[i].g, colors[i].b, value * 255);
                
                image->setPixel(x, y, col);
                return;
            }
        }
    }
    image->setPixel(x, y, sf::Color::Black);
}

void fractal(sf::Image& out_image) {
    auto size = out_image.getSize();
    for (uint y=0; y < size.y; y++) {
        for (uint x=0; x < size.x; x++) {
            pixelNewton(x, y, &out_image);
        }   
    }
}

int main() {    
    sf::RenderWindow window(sf::VideoMode(800, 600), "Newton Fractal (Software Rendering)");
    sf::Event event;
        window.setVerticalSyncEnabled(true);
    
    sf::Image img;
        img.create(WIDTH, HEIGHT);

    
    int max_pixels = img.getSize().x * img.getSize().y;

    sf::Texture text;
        text.loadFromImage(img);


    sf::RectangleShape rect(sf::Vector2f(WIDTH, HEIGHT));
    rect.setPosition(0, 0);
        rect.setTexture(&text);
    

    sf::Text fps_text;
        sf::Font font;
            font.loadFromFile("/usr/share/fonts/truetype/lato/Lato-Black.ttf");
        fps_text.setFont(font);
        fps_text.setPosition(0, 0);

    sf::Clock timer; timer.restart();
    int count = 0;
    sf::Clock fps_timer; fps_timer.restart();
    while (true)
    {
        while (window.pollEvent(event));
        window.clear();
            if (sf::Keyboard::isKeyPressed(sf::Keyboard::A)) {
                zoom -= 100000.0 * timer.getElapsedTime().asSeconds();
                if (zoom <= 0)
                    zoom = 0.1;
            }
            if (sf::Keyboard::isKeyPressed(sf::Keyboard::D)) {
                zoom += 100000.0 * timer.getElapsedTime().asSeconds();
            }
            fractal(img);
                text.loadFromImage(img);

            if (fps_timer.getElapsedTime().asSeconds() >= 1.0) {
                fps_text.setString("FPS: " + std::to_string(count));
                count = 0;
                fps_timer.restart();
            }
            count++;
            window.draw(rect);
            window.draw(fps_text);
        window.display();
        timer.restart();
    }
    
    return 0;
}