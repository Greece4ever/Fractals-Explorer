#ifndef CL_DEVICE_TYPE
    #include <CL/cl2.hpp>
    #include <iostream>
#endif
#include "coordinates.hpp"


cl::Device get_device(int platform_index=0, int device_index=0) {
    using std::vector;
    using std::cout;

    vector<cl::Platform> platforms; cl::Platform::get(&platforms);
    if (platforms.size() == 0) {
        cout << ("No Supported OpenCL implementation found");
        exit(1);
    }

    if (!inRange(0, platforms.size(), platform_index)) {
        cout << ("Index \"" + std::to_string(platform_index) + "\" out of Bounds (at Platform selection).");
        exit(1);
    }
    
    cl::Platform selected_platform = platforms[platform_index];
    vector<cl::Device> devices;

    selected_platform.getDevices(CL_DEVICE_TYPE_GPU, &devices);

    if (devices.size() == 0) {
        cout << "Platform \"" << selected_platform.getInfo<CL_PLATFORM_NAME>() << "\" has no supported devices.\n";
        exit(1);
    }

    if (!inRange(0, devices.size(), device_index)) {
        cout << "Out of bounds index for " << "Platform \"" << selected_platform.getInfo<CL_PLATFORM_NAME>() << "";
        exit(1);
    }

    cl::Device default_device = devices[device_index];

    cout << "Using device \"" << default_device.getInfo<CL_DEVICE_NAME>() << "\" by " << default_device.getInfo<CL_DEVICE_VENDOR>() << "\n" ;
    return default_device;
}
