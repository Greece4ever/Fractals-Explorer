#version 300 es
precision highp float;

out vec4 color;
uniform float colorX;

void main() {
    color = vec4(colorX, 0.3, 1.0, 1.0);
}
