import {defs, tiny} from './examples/common.js';
import { Maze } from './mazegen.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Square, Textured_Phong} = defs

class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'cube': new Cube(),
            'outerwall': new Cube(),
            'floor': new Square(),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            innerWallTexture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/brickwall.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            outerWallTexture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/concretewall.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            floorTexture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/woodenfloor.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
            ceilingTexture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity:1, specularity: 1,
                texture: new Texture("assets/metalceiling.jpg", "LINEAR_MIPMAP_LINEAR")
            }),
        };

        this.colors_array = []
        for (let i = 0; i < 8; i++) {
            this.colors_array.push(color(Math.random()*0.5 + 0.25, Math.random()*0.5 + 0.25, Math.random()*0.5 + 0.25, 1.0));
        }
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(-2.5, -5, -2.5));
        }
        // enforce that the camera is always above the maze
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class MazeGame extends Base_Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    constructor() {
        super();
        this.dim_x = 12;
        this.dim_z = 12;
        this.wall_height = 5;
        this.wall_length = 11;
        this.maze = new Maze(this.dim_x, this.dim_z);
        this.grid = this.maze.getGrid();

        for (let i = 0; i < 24; i++) {
            this.shapes.outerwall.arrays.texture_coord[i] = vec((i % 2) * this.wall_length, Math.floor(i / 2) % 2);
            this.shapes.floor.arrays.texture_coord[i] = vec((i % 2) * 25, (Math.floor(i / 2) % 2) * 25);
        }
    }
    
    set_colors() {
        for (let i = 0; i < 8; i++) {
            this.colors_array[i] = color(Math.random()*0.5 + 0.25, Math.random()*0.5 + 0.25, Math.random()*0.5 + 0.25, 1.0);
        }
    }

    make_control_panel() {
        
    }

    draw_wall(context, program_state, model_transform, block_width, x, z) {
        let color = hex_color("#a8e6cf");
        // randomly generate color
        let cube_x = x * block_width + block_width / 2;
        let cube_z = z * block_width + block_width / 2;
        let cube_y = block_width / 2;  // This places the base of the cube on the ground

        // Create the transformation for the cube
        let cube_transform = model_transform
            .times(Mat4.translation(cube_x, this.wall_height, cube_z))  // Translate the cube to the correct position
            .times(Mat4.scale(block_width / 2, this.wall_height, block_width / 2));  // Scale the cube to fit in the cell

        // Draw the cube
        this.shapes.cube.draw(context, program_state, cube_transform, this.materials.innerWallTexture);
    }

    draw_walls(context, program_state, model_transform, wall_length) {

        for (let i = 0; i < this.grid.length; i++) {
            this.draw_wall(context, program_state, model_transform, wall_length, this.grid[i][0], this.grid[i][1]);
        }
    }

    draw_border(context, program_state, wall_length) {
        const rot = Math.PI/2;
        // these factor in the gaps for entrance and exit
        const h1_length = (this.dim_x)*wall_length;
        const h2_length = (this.dim_x-1)*wall_length;
        const v1_length = (this.dim_z)*wall_length;
        const v2_length = (this.dim_z-1)*wall_length;
        let wall1 = Mat4.identity().times(Mat4.translation(h1_length/2, this.wall_height, 0))
                                   .times(Mat4.rotation(rot, 0, 1, 0))
                                   .times(Mat4.scale(1, this.wall_height, h1_length/2))
        let wall2 = Mat4.identity().times(Mat4.translation(0, this.wall_height, h1_length/2))
                                   .times(Mat4.scale(1, this.wall_height, v1_length/2))
        let wall3 = Mat4.identity().times(Mat4.translation(h2_length + wall_length, this.wall_height, v2_length/2 ))
                                   .times(Mat4.scale(1, this.wall_height, v2_length/2))
        let wall4 = Mat4.identity().times(Mat4.translation(h2_length/2 , this.wall_height, v2_length + wall_length))
                                   .times(Mat4.rotation(rot, 0, 1, 0))
                                   .times(Mat4.scale(1, this.wall_height, h2_length/2))
        this.shapes.outerwall.draw(context, program_state, wall1, this.materials.outerWallTexture);
        this.shapes.outerwall.draw(context, program_state, wall2, this.materials.outerWallTexture);
        this.shapes.outerwall.draw(context, program_state, wall3, this.materials.outerWallTexture);
        this.shapes.outerwall.draw(context, program_state, wall4, this.materials.outerWallTexture);
    }

    display(context, program_state) {
        super.display(context, program_state);
        // since walls are bricks, this represents 7 x 7 x height blocks
        let model_transform = Mat4.identity();
        let floor_transform = Mat4.identity();
        let ceiling_transform = Mat4.identity();

        const t = this.t = program_state.animation_time / 3000;
        this.draw_walls(context, program_state, model_transform, this.wall_length);
        this.draw_border(context, program_state, this.wall_length);
        floor_transform = floor_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0))
            .times(Mat4.scale(this.dim_x*this.wall_length/2, this.dim_z*this.wall_length/2, 1))
            .times(Mat4.translation(1, 1, 0))
        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.floorTexture);

        ceiling_transform = floor_transform.times(Mat4.translation(0, 0, -this.wall_height*2));
        this.shapes.floor.draw(context, program_state, ceiling_transform, this.materials.ceilingTexture);
        // this.shapes.cube.draw(context, program_state, wall_transform, this.materials.plastic.override({color:hex_color("#aaaaaa")}));
    }
}