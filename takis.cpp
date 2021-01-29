#include <iostream>
#include <cmath>
#define print(x) std::cout << x << "\n"

float signedDistance(float x, float y) {
    float X = abs(x), Y = abs(y);
    float max, min, sign;
    
    if (X > Y) {
        max = X;
        min = Y;
        sign = x > 0 ? 1 : -1;
    } else {
        max = Y;
        min = X;
        sign = y > 0 ? 1 : -1;
    }

    return sign * (max - min);
}


int main() {
    print(signedDistance(-7, 5));

    return 0;
}