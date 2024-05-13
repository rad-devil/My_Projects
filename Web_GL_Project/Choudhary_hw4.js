// t =[0,0.25,0.5,0.75,1]
//parametric equation rotationMatrix*[1,2t-1,0]

var canvas;
var gl;
var program;
var program2;
// at the time the vertices are created for the individual line and when that line is rotated to create another set of vertices for another line, 
//use the current and newly caluclated line to calculate indices for triangulation to pass to the vertex shader 
//var num_points = 50; // number of points in  a line
//var num_lines = 70; 

var num_points = 50; // number of points in  a line
var num_lines = 70; 
var indices = [];
var pointsArray = [];
var squarePoints = [];
var once = false;
var normal = [];
var normal_line = [];
var indices1 = [];
var pointsArray1 = [];
var normal1 = [];
var normal_line1 = [];
var light_points = []
var theta_dance = 0.0;
var test = [vec4(0.0, 0.0, 0.0 )];
var vectorthis = vec4(0.0,1.0,0.0,0.0);
var thisone = mat4();
var lightPosition = vec4(0.0, 0.0, 0.0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var draw;
var truth = false;
var shine;
var shine_rec;
var light_position = 0;
var direction = true;
var deltaRadians = 0.00009;
var theta = 0.0;
var thetaLoc;
var static_v = true;
var max_rotation = 0.05;
var dance = false;
var shine_element;
var fov_element;
var fov = 90;
var material1 = true;
var texCoordsArray = [];
var texSize = 128;
var image1 = new Array();
var image2 = new Uint8Array(4*texSize*texSize);
// Initialize the texture array
for (var i = 0; i < texSize; i++)  
    image1[i] = new Array();

// Initialize the values of the texture array
for (var i = 0; i < texSize; i++) 
    for (var j = 0; j < texSize; j++) 
       image1[i][j] = new Float32Array(4);

// Generate a Voronoi diagram texture
var numPoints = 50; // Number of points in the diagram
var points = [];

// Generate random points
for (var i = 0; i < numPoints; i++) {
    points.push({ x: Math.random() * texSize, y: Math.random() * texSize });
}

// Calculate color for each pixel based on distance to nearest point
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var minDist = texSize /2; // Initialize minimum distance to a large value
        var minPoint;
        
        // Find the nearest point
        for (var k = 0; k < numPoints; k++) {
            var dist = Math.sqrt(Math.pow(points[k].x - i, 2) + Math.pow(points[k].y - j, 2));
            if (dist < minDist) {
                minDist = dist;
                minPoint = points[k];
            }
        }
        
        // Assign color based on the nearest point
        var color = [minPoint.x / texSize, minPoint.y / texSize, 0.5, 1]; // Adjust color values as needed
        image1[i][j] = color;
    }
}
// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

    for ( var i = 0; i < texSize; i++ ) 
        for ( var j = 0; j < texSize; j++ ) 
           for(var k =0; k<4; k++) 
                image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];
var texCoordsArrayRec = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var bumpNormals = new Uint8Array(3*texSize*texSize);
var normalRectangle = vec4(0.0, 1.0, 0.0, 0.0);
var tangentRectangle = vec3(1.0, 0.0, 0.0);
/*
var materialAmbient = vec4( 0.0, 0.1, 0.06, 1.0 );
var materialDiffuse = vec4( 0.0, 0.50980392, 0.50980392, 1.0 );
var materialSpecular = vec4( 0.50196078, 0.50196078,0.50196078, 1.0 );
var materialShininess = 0.25; 
*/


var materialAmbient1 = vec4( 0.1745, 0.01175, 0.01175, 1.0 );
var materialDiffuse1 = vec4( 0.61424, 0.04136, 0.04136 , 1.0 );
var materialSpecular1 = vec4( 0.727811 , 0.3 ,0.3, 1.0 );
var materialShininess1 = 10;



var materialAmbient = vec4( 0.0, 0.0, 0.0, 1.0 );
var materialDiffuse = vec4( 0.55, 0.55, 0.55 , 1.0 );
var materialSpecular = vec4( 0.70 , 0.70 ,0.70, 1.0 );
var materialShininess = 10;

/*
var materialAmbient1 = vec4( 0.0, 0.05, 0.0, 1.0 );
var materialDiffuse1 = vec4( 0.4, 0.5, 0.4 , 1.0 );
var materialSpecular1 = vec4( 0.04 , 0.7 ,0.04, 1.0 );
var materialShininess1 = 14;
*/
var materialAmbient2 = vec4( 0.2125, 0.1275, 0.054 , 1.0 );
var materialDiffuse2 = vec4( 0.714, 0.4284 , 0.18144  , 1.0 );
var materialSpecular2 = vec4( 0.393548  , 0.271906 ,0.166721 , 1.0 );
var materialShininess2 = 0.2;



var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var ambientProduct, diffuseProduct, specularProduct;
var ambientProduct_rec, diffuseProduct_rec, specularProduct_rec;

var render_second = true;
var iBuffer;
var vBuffer;
var vBuffer1;

var viewer = 
{
	eye: vec3(0.0, 0.0, 3.0), //3
	at:  vec3(0.0, 0.0, 0.0),  
	up:  vec3(0.0, 1.0, 0.0),
	
	// for moving around object; set vals so at origin
	radius: 3,
    theta: 0,
    phi: 0
};
var cube_vertices = [
    vec4( -1.5, -1,  1, 1.0 ),
    vec4( -1.5,  1,  1, 1.0 ),
    vec4( 1.5,  1,  1, 1.0 ),
    vec4( 1.5, -1,  1, 1.0 ),
    vec4( -1.5, -1, -1, 1.0 ),
    vec4( -1.5,  1, -1, 1.0 ),
    vec4( 1.5,  1, -1, 1.0 ),
    vec4( 1.5, -1, -1, 1.0 )
];

function quad(a, b, c, d) {

    squarePoints.push(cube_vertices[a]); 
   // texCoordsArray.push(texCoord[0]);

    squarePoints.push(cube_vertices[b]); 
   // texCoordsArray.push(texCoord[1]); 

    squarePoints.push(cube_vertices[c]); 
    //texCoordsArray.push(texCoord[2]); 
   
    squarePoints.push(cube_vertices[a]); 
    //texCoordsArray.push(texCoord[0]); 

    squarePoints.push(cube_vertices[c]); 
   // texCoordsArray.push(texCoord[2]); 

    squarePoints.push(cube_vertices[d]); 
    //texCoordsArray.push(texCoord[1]); 
}

function createFunTexture()
{
   

			

}


var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = 0.01;
var farFactor = 3.0;
var far = viewer.radius * farFactor;

var minx = Infinity, maxx = -Infinity;
    var miny = Infinity, maxy = -Infinity;
    var minz = Infinity, maxz = -Infinity;


    function calculateMinMaxBox(vertices) {
        // Initialize min and max coordinates with the first vertex
        let minX = vertices[0][0];
        let minY = vertices[0][1];
        let minZ = vertices[0][2];
        let maxX = vertices[0][0];
        let maxY = vertices[0][1];
        let maxZ = vertices[0][2];
    
        // Iterate through all vertices to find min and max coordinates
        for (let i = 1; i < vertices.length; i++) {
            let vertex = vertices[i];
            minX = Math.min(minX, vertex[0]);
            minY = Math.min(minY, vertex[1]);
            minZ = Math.min(minZ, vertex[2]);
            maxX = Math.max(maxX, vertex[0]);
            maxY = Math.max(maxY, vertex[1]);
            maxZ = Math.max(maxZ, vertex[2]);
        }
    
        // Return the minMaxBox as an object
        return {
            minX: minX,
            minY: minY,
            minZ: minZ,
            maxX: maxX,
            maxY: maxY,
            maxZ: maxZ
        };
    }

   
 
function Cylinder_Parametric()
{
    return 1;
}

function Corrugated_Parametric(v)
{
    
    var a = 0.6;
    var b = 1.8;
    var c = -1.3;
    var q = b*v + c;
    //return Math.sin(v);
    return (a*Math.sin(q));
    //return Math.cos(v);



}

function configureTextureFunction(myimage) {

    texture = gl.createTexture();
    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, texture );
	
	// flip is not necessary for checkerboard -- this is for input formats like gif
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	
	// this is set up for "image2" which is unsigned byte
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, myimage);
		
	//NEAREST_MIPMAP_LINEAR = no filtering on mip but linear filtering on 2 nearest mipmaps
	// see top of file for summary of settings
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
}


function generateTexturePoints(startPoint, endPoint, numPoints, fixedCoordIndex) {
    const points = [];
    const deltaX = (endPoint[0] - startPoint[0]) / (numPoints - 1);
    const deltaY = (endPoint[1] - startPoint[1]) / (numPoints - 1);
    const fixedCoord = startPoint[fixedCoordIndex];

    // Generate points with one coordinate fixed and the other coordinate equally spaced
    for (let i = 0; i < numPoints; i++) {
        const coord1 = fixedCoordIndex === 0 ? fixedCoord : startPoint[0] + i * deltaX;
        const coord2 = fixedCoordIndex === 1 ? fixedCoord : startPoint[1] + i * deltaY;
        points.push([coord1, coord2]);
    }

    return points;
}


function configureTexture( myimage ) {
    
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.activeTexture(gl.TEXTURE0);
    
	// gif image needs flip of y-coord
    gl.activeTexture(gl.TEXTURE0);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
         gl.RGB, gl.UNSIGNED_BYTE, myimage );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    
    
}

function configureTextureBump( bump ) {
    texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, bump);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
   
}


function Corrugated_Parametric_derivative(v,i)
{
    
    var a = 0.6;
    var b = 1.8;
    var c = -1.3;
    var q = b*v + c;
    //return Math.PI*i*Math.cos(v);
   return (a*b*Math.PI*i*Math.cos(q));



}

function TextureMappingBump() {
    
    texCoordsArrayRec.push(texCoord[0]);


    texCoordsArrayRec.push(texCoord[1]); 

  
    texCoordsArrayRec.push(texCoord[2]); 
   
    
    texCoordsArrayRec.push(texCoord[0]); 


    texCoordsArrayRec.push(texCoord[2]); 

 
    texCoordsArrayRec.push(texCoord[3]);        
}


function surfaceEvaluate1(theta,a,b,offset)
{
    
   //var rotY = rotateY(theta);
   var interval = (b-a)/(num_points-1);
   //console.log("interval = ",interval);
   //console.log("roty",rotY);
  
   for (let i = 0; i < num_points;i++)
   {
    //console.log("subpoints = ",i*interval);
    var t = (interval+offset)*Math.PI*i;
    
    
    var vertice = vec3(Math.cos(radians(theta))*Corrugated_Parametric(t),a+(i*interval),Math.sin(radians(theta))*Corrugated_Parametric(t)); 
    pointsArray1.push(vertice);
    var derivative = Corrugated_Parametric_derivative(t,interval+offset);

    var normal_point = normalize(cross(vec3(Math.cos(radians(theta))*derivative,interval,Math.sin(radians(theta))*derivative),vec3(-Math.sin(radians(theta))*Corrugated_Parametric(t),0,Math.cos(radians(theta))*Corrugated_Parametric(t))));
    normal1.push(normal_point);
    //normal_line.push(vertice);
    //console.log("vertice",vertice)
    //console.log("chnage", vec3(vertice[0]+normal_point[0],vertice[1]+normal_point[1],vertice[2]+normal_point[2]));
    var first = vertice[0]+0.3*normal_point[0];
    //console.log("first_element",first);
    //console.log("x",vertice[0]);
    //console.log("y",normal_point[0]);

    var second = vertice[1]+0.3*normal_point[1];
    var third = vertice[2]+0.3*normal_point[2];

    normal_line1.push(vertice);
    normal_line1.push(vec3(first,second,third));
   }
  

}
function light_interpolation(static)
{
    light_points = [];
    if (!static)
    {
        var degree_interval = 360/(1000);

    for (let i = 0; i < 300;i++)
{   //console.log("angle = ",i*degree_interval )
    light_points.push(vec4(2*Math.cos(radians(i*degree_interval)),0,2*Math.sin(radians(i*degree_interval)),1.0));
}
    }

    else{
        
        light_points.push(lightPosition);
}
    }
    


function surfaceEvaluate(theta,a,b,offset)
{


   

   //var rotY = rotateY(theta);
   var interval = (b-a)/(num_points-1);
   //console.log("interval = ",interval);
   //console.log("roty",rotY);
   for (let i = 0; i < num_points;i++)
   {
    //console.log("subpoints = ",i*interval);
    
    var vertice = vec3(Math.cos(radians(theta)),a+(i*interval),Math.sin(radians(theta))); 
    pointsArray.push(vertice);
    var normal_point = normalize(cross(vec3(0,interval,0),vec3(-Math.sin(radians(theta)),0,Math.cos(radians(theta)))));
    normal.push(normal_point);
    //normal_line.push(vertice);
    //console.log("vertice",vertice)
    //console.log("chnage", vec3(vertice[0]+normal_point[0],vertice[1]+normal_point[1],vertice[2]+normal_point[2]));
    var first = vertice[0]+0.3*normal_point[0];
    //console.log("first_element",first);
    //console.log("x",vertice[0]);
    //console.log("y",normal_point[0]);

    var second = vertice[1]+0.3*normal_point[1];
    var third = vertice[2]+0.3*normal_point[2];

    normal_line.push(vertice);
    normal_line.push(vec3(first,second,third));
   }
  

}

  

function triangulation(a,b,offset)
{
    var neighbour1 = 0;
    var neighbour2 = 1;
    var count = 0;
    var count_outer = 0;
    var deltaX = (1) / (num_lines);



    var degree_interval = 360/(num_lines);


        for (let i = 0; i < num_lines;i++)
    {   //console.log("angle = ",i*degree_interval )
        surfaceEvaluate(i*degree_interval,a,b,offset);
        texCoordsArray = [...texCoordsArray, ...generateTexturePoints([deltaX*i,0], [deltaX*i,1], num_points, 0)];
        //texCoordsArray.concat(generateTexturePoints([deltaX*i,0], [deltaX*i,1], num_points, 0));
        
        
    }
    surfaceEvaluate(360,a,b,offset);
    texCoordsArray = [...texCoordsArray, ...generateTexturePoints([1,0], [1,1], num_points, 0)];

    //texCoordsArray = [...texCoordsArray, ...generateTexturePoints([0,0], [0,1], num_points, 0)];
   
    console.log(texCoordsArray);

    
 
    
    

    while(neighbour1 != num_lines)
    {
        for (let x = 0; x < num_points-1; x++)
        {
        
            indices.push(vec3((x+(neighbour1*num_points)),(x+1+(neighbour1*num_points)),(x+(neighbour2*num_points))));
           
           
            //indices.push(vec3((x+1+(neighbour2*num_points)),(x+1+(neighbour1*num_points)),(x+(neighbour2*num_points))));

            indices.push(vec3((x+(neighbour2*num_points)),(x+1+(neighbour2*num_points)),(x+1+(neighbour1*num_points))));
           
          

          
               
        }
        neighbour1++;
        neighbour2++;
       
    }
}


function triangulation1(a,b,offset)
{
    var neighbour1 = 0;
    var neighbour2 = 1;
    var degree_interval = 360/(num_lines);

        for (let i = 0; i < num_lines;i++)
    {   //console.log("angle = ",i*degree_interval )
        surfaceEvaluate1(i*degree_interval,a,b,offset);
    }

  
    surfaceEvaluate1(360,a,b,offset);
    

    while(neighbour1 != num_lines)
    {
        for (let x = 0; x < num_points-1; x++)
        {
            indices1.push(vec3((x+(neighbour1*num_points)),(x+1+(neighbour1*num_points)),(x+(neighbour2*num_points))));
            indices1.push(vec3((x+(neighbour2*num_points)),(x+1+(neighbour2*num_points)),(x+1+(neighbour1*num_points))));
        }
        neighbour1++;
        neighbour2++;
        
    }
}

function reinitialize()
{
    pointsArray = [];
    normal = []; 
    normal_line = [];
    indices = [];
    pointsArray1 = [];
    normal1 = []; 
    normal_line1 = [];
    indices1 = [];

}


window.onload = function init() {
    
    //console.log("start =",mult(mat3(),vectorthis));
   

    //configureTextureFunction( image1 );

   
    
    canvas = document.getElementById( "gl-canvas" );

    shine_element = document.getElementById("shine");

    fov_element = document.getElementById("fov");
       
    
    gl = WebGLUtils.setupWebGL( canvas );
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    var myimage = new Image();
    myimage.crossOrigin = "anonymous";
    myimage.onload = function() { 
        configureTexture( myimage );
    }
   
    //myimage.src = "SA2011_black.gif"
    //myimage.src = window.Duong_hw4_image1_data_url;

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    program2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );
    if (!once)
    {
        createBumpMapDiamond();
    configureTextureBump(bumpNormals);
    TextureMappingBump();
        once = true;
    }

    if (material1)
    {
        
        createFunTexture();
        console.log("Image 1", image2);
        configureTextureFunction(image2);
       
        
    }
    else
    {
       


        myimage.src = window.Duong_hw4_image1_data_url;
   

    //myimage.src = window.SA2011_black_data_url
    
   

    }

    

   
    console.log("Image 2", image2);

    //
    //  Load shaders and initialize attribute buffers
    //
    
    
     /*
     document.getElementById("show-normal").onclick = function(){
        render_second = true;    
        init();
    };
    document.getElementById("unshow_normal").onclick = function(){
        render_second = false;
        
        init();
    };
    */
    document.getElementById("cylinder").onclick = function(){
        truth = true;
        reinitialize();   
       init();
    };
    document.getElementById("sinusodial").onclick = function(){
        truth = false;
        reinitialize();
        init();
    };

    

    document.getElementById("material1").onclick = function(){
        material1 = true;
        reinitialize();
        init();
    };

    document.getElementById("material2").onclick = function(){
        material1 = false;
        reinitialize();
        init();
    };
 
    document.getElementById("static_light").onclick = function(){
        static_v = true;
        reinitialize();
        init();
    };
    document.getElementById("moving_light").onclick = function(){
        static_v = false;
        reinitialize();
        init();
    };
    document.getElementById("dance").onclick = function(){
        dance = true;
        reinitialize();
        init();
    };
    document.getElementById("stop_dance").onclick = function(){
        dance = false;
        reinitialize();
    
        init();
    };
   
    if (material1)
    {
        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);
        shine = materialShininess;
        
    }
    else{
        ambientProduct = mult(lightAmbient, materialAmbient1);
        diffuseProduct = mult(lightDiffuse, materialDiffuse1);
        specularProduct = mult(lightSpecular, materialSpecular1);
        shine = materialShininess1;
    }

        ambientProduct_rec = mult(lightAmbient, materialAmbient2);
        diffuseProduct_rec = mult(lightDiffuse, materialDiffuse2);
        specularProduct_rec= mult(lightSpecular, materialSpecular2);
        shine_rec = materialShininess2;
        quad( 3, 0, 4, 7 );
        //createBumpMapRectangle();
       
    
   
   

  

    thetaLoc = gl.getUniformLocation( program, "theta" );
    /*
    pointsArray = [];
    normal = []; 
    indices = [];
    */
   
   // quad( 1, 0, 3, 2 ) ;    
    //quad( 2, 3, 7, 6 );
    
   
    //quad( 6, 5, 1, 2 );
  //  quad( 4, 5, 6, 7 );
   // quad( 5, 4, 0, 1 );
    triangulation(-1,1,0);
    triangulation1(-1,1,0);
    light_interpolation(static_v);
    if(truth)
    {
        console.log("Minmax", calculateMinMaxBox(pointsArray));
    }
    else
    {
        console.log("Minmax", calculateMinMaxBox(pointsArray1));
    }
    
    console.log("Initial look at eye:", vec3(0.0, 0.0, 3.0));
    console.log("Initial look at at:", vec3(0.0, 0.0, 0.0));
    console.log("Initial look at up:", vec3(0.0, 1.0, 0.0));
    console.log("Initial perspective fov:",60);
    console.log("Initial perspective aspect:",1);
    console.log("Initial perspective near:",1);
    console.log("Initial perspective far:",100);
    console.log("Initial light position:",vec3(0.0, 0.0, 0.0));


  
    // array element buffer
    
    //console.log("vertices = ",pointsArray);
    //console.log("indices = ",indices);
    //render();
    renderboth();
    
}



function renderboth(){
    shine_element.addEventListener("input", function() {
        // Update the paragraph text with the current slider value
        shine = shine_element.value;
     
      
    });
    
    fov_element.addEventListener("input", function() {
        // Update the paragraph text with the current slider value
        fov = fov_element.value;
     
      
    });
    if (dance)
    {
        theta_dance += (direction ? deltaRadians : -deltaRadians);
        if(theta_dance > (max_rotation))
        {
            direction = false;
            
    
        }
        
    
        if(theta_dance < (-max_rotation))
        {
            direction = true;
        }
        pointsArray1 = [];
        normal1 = []; 
        normal_line1 = [];
        indices1 = [];
        triangulation1(-1,1,theta_dance);
    }

    light_position += 1;
    
    if (light_position >= light_points.length )
    {
        light_position = 0;
    }
    if(truth)
    {
       render(indices,normal,pointsArray);
        if (render_second)
    {
        render2(squarePoints);
    }
    }
    else
    {
        render(indices1,normal1,pointsArray1);
        if (render_second)
    {
        render2(squarePoints);
    }

    }
    

   
    
    window.requestAnimFrame(renderboth);

}

function render(index,norm,points) {

    
    //console.log("indices = ",indices);
    //console.log("points = ",pointsArray);
    //console.log("normals = ", normal);
    
    gl.useProgram( program );
    
    iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(flatten(index)), gl.STATIC_DRAW);

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW )

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(norm), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );
	
    
 
	
	// (this is missing in version on canvas 3/2022)
    

    gl.uniform4fv( gl.getUniformLocation(program, 
        "ambientProduct"),flatten(ambientProduct) );
     gl.uniform4fv( gl.getUniformLocation(program, 
        "diffuseProduct"),flatten(diffuseProduct) );
     gl.uniform4fv( gl.getUniformLocation(program, 
        "specularProduct"),flatten(specularProduct) );	
     gl.uniform4fv( gl.getUniformLocation(program, 
        "lightPosition"),flatten(light_points[light_position]) );
     gl.uniform1f( gl.getUniformLocation(program, 
        "shininess"),shine );
       
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    projectionMatrix = perspective( fov, 1, 1, 100 );
    //console.log("projection = ",projectionMatrix);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
	       
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    //console.log("legnth = ",pointsArray.length);
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    draw = (((2*num_points)-2)*3)*num_lines;
    
 	gl.drawElements( gl.TRIANGLES, draw, gl.UNSIGNED_SHORT, 0 );      //6 is the number number of vertices used to form triangles between two lines
     
    gl.drawArrays(gl.POINTS, 0, 1); 
   
    mouseControls();
     
}


function render2(norm_lines) {
    
    //console.log("indices = ",indices);
    //console.log("points = ",pointsArray);
    //console.log("normals = ", normal);
    
    
    gl.useProgram( program2 );
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
    var normalMatrix = normalMatrixMat3(modelViewMatrix);

    vBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(norm_lines), gl.STATIC_DRAW );

    var vPosition1 = gl.getAttribLocation( program2, "vPosition" );
    gl.vertexAttribPointer( vPosition1, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition1 );
    
    modelViewMatrixLoc = gl.getUniformLocation( program2, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program2, "projectionMatrix" );
    projectionMatrix = perspective( fov, 1, 1, 100 );
    //console.log("projection = ",projectionMatrix);

    gl.uniform4fv( gl.getUniformLocation(program2, 
        "ambientProduct"),flatten(ambientProduct_rec) );
     gl.uniform4fv( gl.getUniformLocation(program2, 
        "diffuseProduct"),flatten(diffuseProduct_rec) );
     gl.uniform4fv( gl.getUniformLocation(program2, 
        "specularProduct"),flatten(specularProduct_rec) );	
     gl.uniform4fv( gl.getUniformLocation(program2, 
        "lightPosition"),flatten(light_points[light_position]) );
     gl.uniform1f( gl.getUniformLocation(program2, 
        "shininess"),shine );
        gl.uniform1i(gl.getUniformLocation( program2, "texture"), 1);
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArrayRec), gl.STATIC_DRAW);
    var vTexCoord1 = gl.getAttribLocation( program2, "vTexCoord2" );
    gl.vertexAttribPointer( vTexCoord1, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord1 );

    //gl.uniform1i(gl.getUniformLocation( program2, "texture"), 0);

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    gl.uniform4fv( gl.getUniformLocation(program2, "normal"),flatten(normalRectangle));
    gl.uniform3fv( gl.getUniformLocation(program2, "objTangent"),flatten(tangentRectangle));
    gl.uniformMatrix3fv( gl.getUniformLocation(program2, "normalMatrix"), false, flatten(normalMatrix));
    //gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    modelViewMatrix = lookAt(vec3(viewer.eye), viewer.at, viewer.up);
	       
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    
    //gl.drawArrays(gl.LINES, 0, num_points*num_lines*4)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
     //6 is the number number of vertices used to form triangles between two lines
     mouseControls();
   
}



/*
var fovy = 60;
var aspect = 1;
var near = 1
var far = 100


perspective( fovy, aspect, near, far ) */