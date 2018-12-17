Installation
==========================

## System Requirements

### Supported browsers
For the client, Chrome and Safari are recommended. Edge and Firefox are also supported. The latest version is strongly recommended for all the browsers.
- Chrome: version 60 or later
- Safari: version 10 or later
- Edge: version 11 or later
- Firefox: version 52 or later

### Server: online and offline use
Since Psychlops JS operates as a Web application, it basically assumes that it is installed on an HTTP server and accessed via the Internet.

## Using Psychlops on the HTTP server

### Installation
1.	Unzip all files from the package or git clone from server.
2.	Upload all the unzipped files on your HTTP server. The folder structure should be kept as is.
3.	Delete “index.html” in the top folder.
4.	Rename “index.online.html” to “index.html”.
5.	Access your HTTP server from web-browser. URL depends on your server setting.


### Editing

#### Editing index
Open “index.menu.html” at top of the Psychlops JS folder. Then, Please edit <li> elements inside the file. To open editor, write “psychlops.editor.html” inside the href attribute in the <a> element. To open experiment directly, write “psychlops.player.html” inside the href attribute.

#### Editing use
Edit cpp files directly.



## Setup of test environment in local system
It is possible to test the online program in the local environment by running the HTTP server on the local system. Methods for executing the HTTP server in the local environment include the following, for example:
- (macOS and linux) Setup Apache server with package management system such as APT or MacPorts
- (Windows and macOS) Use third-party package to install Apache such as MAMP
- (Windows) Use Microsoft Visual Studio 


### MAMP (for Windows and macOS)
1.	Download MAMP installer from official website (https://www.mamp.info/en/).
2.	Install MAMP. MAMP Pro is not needed.
3.	Place Psychlops JS files in MAMP’s “htdocs” folder.
4.	Access “localhost” from web-browser.
5.	Edit “index.menu.html” with favorite text editor to edit menu in index.html.
6.	Edit arbitrary cpp files with text editor.
