// Physics constants and utilities for apple motion

export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsObject {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  restitution: number; // Bounciness factor
}

// Constants
export const GRAVITY = 0.5;
export const AIR_RESISTANCE = 0.99;
export const BOUNCE_DAMPING = 0.7;

// Update physics for a falling object
export function updatePhysics(obj: PhysicsObject, deltaTime: number = 1): PhysicsObject {
  // Apply acceleration (gravity)
  const newVelocityY = obj.velocity.y + (obj.acceleration.y + GRAVITY) * deltaTime;
  const newVelocityX = obj.velocity.x * AIR_RESISTANCE;
  
  // Update position based on velocity
  const newPositionX = obj.position.x + newVelocityX * deltaTime;
  const newPositionY = obj.position.y + newVelocityY * deltaTime;
  
  return {
    ...obj,
    position: { x: newPositionX, y: newPositionY },
    velocity: { x: newVelocityX, y: newVelocityY }
  };
}

// Handle collision with a surface
export function handleCollision(
  obj: PhysicsObject, 
  surfaceY: number, 
  surfaceX1: number, 
  surfaceX2: number
): PhysicsObject {
  const { position, velocity, restitution } = obj;
  
  // Check if object is within horizontal bounds of the surface
  if (position.x >= surfaceX1 && position.x <= surfaceX2) {
    // Check if object has hit the surface
    if (position.y >= surfaceY) {
      // Bounce effect - reverse velocity with damping
      return {
        ...obj,
        position: { ...position, y: surfaceY },
        velocity: { 
          x: velocity.x * 0.8, // Reduce horizontal momentum
          y: -velocity.y * restitution * BOUNCE_DAMPING // Bounce with damping
        }
      };
    }
  }
  
  return obj;
}

// Calculate if an object has come to rest
export function isAtRest(obj: PhysicsObject, threshold: number = 0.5): boolean {
  return Math.abs(obj.velocity.x) < threshold && Math.abs(obj.velocity.y) < threshold;
}
