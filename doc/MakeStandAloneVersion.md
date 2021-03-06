Building Stand-alone (offline) Version
===========================================


Due to security limitations, JavaScript cannot read and write local files on your computer. Program files should be embeded in the HTML file. Image files are also needed to be linked by <img> tags in the HTML file, not only `load` function in the JavaScript program.


### Using Psychlops on the HTTP server

#### Installation
1.	Unzip all files from the package or git clone from server.
2.	Upload all the unzipped files on your HTTP server. The folder structure should be kept as is.
3.	Delete “index.html” in the top folder.
4.	Rename “index.online.html” to “index.html”.
5.	Access your HTTP server from web-browser. URL depends on your server setting.

### Using Psychlops on the local system

#### Installation
1.	Unzip all files from the package or git clone from server.
2.	Open “index.html” in the top folder of unzipped files in the local system.
3.	Try sample stimuli.
4.	Some functions are restricted in executing on the local system. For example, image files could not be loaded from local file system for security reason.


### Editing

#### Online use
Edit cpp files directly.

##### Editing index
Open “index.menu.html” at top of the Psychlops JS folder. Then, Please edit <li> elements inside the file. To open editor, write “psychlops.editor.html” inside the href attribute in the <a> element. To open experiment directly, write “psychlops.player.html” inside the href attribute.

#### Offline use
After editing cpp files, copy whole C++ programs inside the <textarea id="running_program"> element at the end of “psychlops.offline.template.html” file.


#### Editing index
Open “index.html” at top of the Psychlops JS folder. Then, Please edit <li> elements inside the <section id="menu_list"> element at the last of the file.


### Setup of test environment in local system
It is possible to test the online program in the local environment by running the HTTP server on the local system. Methods for executing the HTTP server in the local environment include the following, for example:
- (macOS and linux) Setup Apache server with package management system such as APT or MacPorts
- (Windows and macOS) Use third-party package to install Apache such as MAMP
- (Windows) Use Microsoft Visual Studio 


#### MAMP (for Windows and macOS)
1.	Download MAMP installer from official website (https://www.mamp.info/en/).
2.	Install MAMP. MAMP Pro is not needed.
3.	Place Psychlops JS files in MAMP’s “htdocs” folder.
4.	Access “localhost” from web-browser.
5.	Edit “index.menu.html” with favorite text editor to edit menu in index.html.
6.	Edit arbitrary cpp files with text editor.
