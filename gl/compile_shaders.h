#ifndef __glew_h__
    #include <GL/glew.h>
#endif
#ifndef _GLIBCXX_STRING
    #include <string>
#endif
#ifndef EXIT_FAILURE
    #define EXIT_FAILURE 1
#endif
#include <iostream>
#ifndef __PRODUCTION__
    std::string get_err() {
        GLenum err = glGetError();
        if (err != GL_NO_ERROR) {
            std::string ERROR = "\033[1;32m" + (std::string)"[Error " + std::to_string(err) + "]";
            return ERROR;
        }
        std::string suc = "\033[1;32m" + (std::string)"[Sucess] " + (std::string)"\033[0m";
        return suc;
    }
    #define glCall() std::cout << get_err() << " File " << "\033[1;32m" << "\"" << __FILE__ << "\"" << "\033[0m" << " at line " << "\033[1;35m" << __LINE__ << "\033[0m" << "\n";
#endif
#include <fstream>  
#include <string.h>

GLuint compileShader(GLuint type, std::string& src) 
{
    GLuint s_id = glCreateShader(type);
    const GLchar* source = src.c_str();
    glShaderSource(s_id, 1, &source, NULL);
    glCompileShader(s_id);

    // See if compilation went OK
    GLint isCompiled = 0;
    glGetShaderiv(s_id, GL_COMPILE_STATUS, &isCompiled);

    if (isCompiled == GL_FALSE) 
    {
        GLint err_length = 0;
        glGetShaderiv(s_id, GL_INFO_LOG_LENGTH, &err_length);
        GLchar* error_string = (GLchar*)malloc(err_length * sizeof(GLchar));
        glGetShaderInfoLog(s_id, err_length, &err_length, error_string);

        printf("%s", error_string);
        
        free(error_string);
        glDeleteShader(s_id);
        exit(EXIT_FAILURE);
    }

    return s_id;
}


GLuint createProgram(std::string vertexShader, std::string fragmentShader)
{
    GLuint program = glCreateProgram();
    GLuint vs = compileShader(GL_VERTEX_SHADER, vertexShader);
    GLuint fs = compileShader(GL_FRAGMENT_SHADER, fragmentShader);

    glAttachShader(program, vs);
    glAttachShader(program, fs);
    glLinkProgram(program);
    glValidateProgram(program);

    // glGetProgramiv(program, GL_VALIDATE_STATUS, )

    //glDetachShader
    glDeleteShader(vs);
    glDeleteShader(fs); 
    
    return program;
}

std::string readf(std::string path) {
    std::ifstream file;
    file.open(path);
    if (!file.is_open()) {
        std::string err = strerror( errno );
        printf("Could not open file \"%s\": %s\n", path.c_str(), err.c_str());
        exit(EXIT_FAILURE);
    }

    std::string buffer;
    std::string line;
    
    while (getline(file, line)) {
        buffer += line + "\n";
    }

    return buffer;
}

