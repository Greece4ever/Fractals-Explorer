struct complex {
    double real;
    double imag;
};


__constant int columns = $0;
__constant double initialCenterX = $1;
__constant double initialCenterY = $2;


__kernel void mandel(
    __global float *iter,
    __global float *SMOOTH,

    const double offsetX, const double offsetY, 
    const double zoom, const int iterations)
{
    int col = get_global_id(0);
    int row = get_global_id(1);

    double centerX = initialCenterX + offsetX;
    double centerY = initialCenterY + offsetY;

    double x = (col - centerX) / zoom;
    double y =  -(row - centerY) / zoom;

    struct complex z, _z;
    z.real = 0, _z.real = 0;  
    z.imag = 0; _z.imag = 0;

    float a_2, b_2;
    int local_iterations;

    for (local_iterations=0; local_iterations < iterations; local_iterations++)
    {
        a_2 = _z.real * _z.real;
        b_2 = _z.imag * _z.imag;
        
        z.real = a_2 - b_2;
        z.imag = 2 * _z.real * _z.imag;
        
        z.real += x;
        z.imag += y;

        _z.real = z.real;
        _z.imag = z.imag;

        if (a_2 + b_2 > 4)
            break;
    }

    int tid = row * columns + col;


    float smooth = local_iterations + 1 - log(log(sqrt(a_2 + b_2)) / 2);
    iter[tid] = ((float)local_iterations / (float)iterations);
    SMOOTH[tid] = smooth;
}
