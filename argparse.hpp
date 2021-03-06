#ifndef iostream
	#include <iostream>
	#define log_msg(x) std::cout << x << "\n"
	#include <sstream>
#endif
#include <fstream>

void rplc(std::string& str, std::string word, std::string rplcmt) {
	str.replace(str.find(word), sizeof("$1") - 1, rplcmt);
}

std::string load_source(std::string path="mandelbrot.cl") {
  	std::ifstream input(path);
  	std::stringstream sstr;

  	if (input.fail()) {
	  	log_msg("[Fatal Error] Failed to open file \"" + path + "\".");
	  	exit(1);
  	}

  	while(input >> sstr.rdbuf());

	return sstr.str();
}

std::string loadKernelSource(std::string path, std::string width, std::string height, int cord_array[]) {
	if (width.length() > 5 || height.length() > 5)
	{
		log_msg("Input width and/or height too large to be proccesed.");
		exit(1);
	}
	std::string source_code = load_source(path);
	
	int __width  = std::stoi(width.c_str());
	int __height = std::stoi(height.c_str());

	rplc(source_code, "$0", std::to_string(__width));
	rplc(source_code, "$1", std::to_string((double)__width  / 2.0));
	rplc(source_code, "$2", std::to_string((double)__height / 2.0));

	cord_array[0] = __width;
	cord_array[1] = __height;

	return source_code;
}




// int main(int argc, char* argv[], char* envp[]) {
// 	#ifndef HELLO
// 		using std::string;
		
// 		if (argc <= 2) {
// 			log_msg("No width and/or height specified.");
// 			exit(1);
// 		}

// 		log_msg("Width is " +  (std::string)argv[1]);
// 		log_msg("Height is " + (std::string)argv[2]);
// 	#endif

// 	int cords[2];
// 	std::string source =  loadKernelSource("mandelbrot.cl", "800", "600", cords);

// 	log_msg(cords[0]);
// 	log_msg(cords[1]);

	
// 	// log_msg(source);

// 	return 0;

// }