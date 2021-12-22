import {Coord2D, CoordDistance2D, SubCoord2D} from "../geometry/coord2d.js";
import {CoordDistance3D, CoordIsEqual3D, CrossVector3D, SubCoord3D, VectorAngle3D} from "../geometry/coord3d.js";
import {ParabolicTweenFunction, TweenCoord3D} from "../geometry/tween.js";
import {DegRad, IsGreater, IsLower, IsZero} from "../geometry/geometry.js";

export function GetClientCoordinates  (canvas, clientX, clientY)
{
    if (canvas.getBoundingClientRect) {
        let clientRect = canvas.getBoundingClientRect ();
        clientX -= clientRect.left;
        clientY -= clientRect.top;
    }
    if (window.pageXOffset && window.pageYOffset) {
        clientX += window.pageXOffset;
        clientY += window.pageYOffset;
    }
    return (new Coord2D (clientX, clientY));
};

export class Camera
{
    constructor (eye, center, up)
    {
        this.eye = eye;
        this.center = center;
        this.up = up;
    }

    Clone ()
    {
        return new Camera (
            this.eye.Clone (),
            this.center.Clone (),
            this.up.Clone ()
        );
    }
};

export class MouseInteraction
{
    constructor ()
    {
        this.prev = new Coord2D (0.0, 0.0);
        this.curr = new Coord2D (0.0, 0.0);
        this.diff = new Coord2D (0.0, 0.0);
        this.buttons = [];
    }

    Down (canvas, ev)
    {
        this.buttons.push (ev.which);
        this.curr = this.GetCurrent (canvas, ev);
        this.prev = this.curr.Clone ();
    }

    Move (canvas, ev)
    {
        this.curr = this.GetCurrent (canvas, ev);
				this.diff = SubCoord2D (this.curr, this.prev);
				this.prev = this.curr.Clone ();
		}

		Up (canvas, ev)
		{
			let buttonIndex = this.buttons.indexOf (ev.which);
			if (buttonIndex !== -1) {
				this.buttons.splice (buttonIndex, 1);
			}
			this.curr = this.GetCurrent (canvas, ev);
		}

		Leave (canvas, ev)
		{
			this.buttons = [];
			this.curr = this.GetCurrent (canvas, ev);
		}

		IsButtonDown ()
		{
			return this.buttons.length > 0;
		}

		GetButton ()
		{
			let length = this.buttons.length;
			if (length === 0) {
				return 0;
			}
			return this.buttons[length - 1];
		}

		GetMoveDiff ()
		{
			return this.diff;
		}

		GetCurrent (canvas, ev)
		{
			return GetClientCoordinates (canvas, ev.clientX, ev.clientY);
		}
};

export class TouchInteraction
{
	constructor ()
	{
		this.prevPos = new Coord2D (0.0, 0.0);
		this.currPos = new Coord2D (0.0, 0.0);
		this.diffPos = new Coord2D (0.0, 0.0);
		this.prevDist = 0.0;
		this.currDist = 0.0;
		this.diffDist = 0.0;
		this.fingers = 0;
	}

	Start (canvas, ev)
	{
		if (ev.touches.length === 0) {
			return;
		}

		this.fingers = ev.touches.length;

		this.currPos = this.GetCurrent (canvas, ev);
		this.prevPos = this.currPos.Clone ();

		this.currDist = this.GetTouchDistance (canvas, ev);
		this.prevDist = this.currDist;
	}

	Move (canvas, ev)
	{
		if (ev.touches.length === 0) {
			return;
		}
		this.currPos = this.GetCurrent (canvas, ev);
		this.diffPos = SubCoord2D (this.currPos, this.prevPos);
		this.prevPos = this.currPos.Clone ();

		this.currDist = this.GetTouchDistance (canvas, ev);
		this.diffDist = this.currDist - this.prevDist;
		this.prevDist = this.currDist;
	}

	End (canvas, ev)
	{
		if (ev.touches.length === 0) {
			return;
		}
		this.fingers = 0;
		this.currPos = this.GetCurrent (canvas, ev);
		this.currDist = this.GetTouchDistance (canvas, ev);
	}

	IsFingerDown ()
	{
		return this.fingers !== 0;
	}

	GetFingerCount ()
	{
		return this.fingers;
	}

	GetMoveDiff ()
	{
		return this.diffPos;
	}

	GetDistanceDiff ()
	{
		return this.diffDist;
	}

	GetCurrent (canvas, ev)
	{
		let coord = null;
		if (ev.touches.length !== 0) {
			let touchEv = ev.touches[0];
			coord = GetClientCoordinates (canvas, touchEv.pageX, touchEv.pageY);
		}
		return coord;
	}

	GetTouchDistance (canvas, ev)
	{
		if (ev.touches.length !== 2) {
			return 0.0;
		}
		let touchEv1 = ev.touches[0];
		let touchEv2 = ev.touches[1];
		let distance = CoordDistance2D (
			GetClientCoordinates (canvas, touchEv1.pageX, touchEv1.pageY),
			GetClientCoordinates (canvas, touchEv2.pageX, touchEv2.pageY)
		);
		return distance;
	}
};

export class ClickDetector
{
	constructor ()
	{
		this.isClick = false;
		this.button = 0;
	}

	Down (ev)
	{
		this.isClick = true;
		this.button = ev.which;
	}

	Move ()
	{
		this.isClick = false;
	}

	Up (ev)
	{
		if (this.isClick && ev.which !== this.button) {
			this.isClick = false;
		}
	}

	Leave ()
	{
		this.isClick = false;
		this.button = 0;
	}

	IsClick ()
	{
		return this.isClick;
	}
};

export let NavigationType =
{
	None : 0,
	Orbit : 1,
	Pan : 2,
	Zoom : 3
};

export class Navigation
{
	constructor (canvas, camera)
	{
		this.canvas = canvas;
		this.camera = camera;
		this.orbitCenter = this.camera.center.Clone ();
		this.fixUpVector = true;

		this.mouse = new MouseInteraction ();
		this.touch = new TouchInteraction ();
		this.clickDetector = new ClickDetector ();

		this.onUpdate = null;
		this.onClick = null;
		this.onContext = null;

		if (this.canvas.addEventListener) {
			this.canvas.addEventListener ('mousedown', this.OnMouseDown.bind (this));
			this.canvas.addEventListener ('wheel', this.OnMouseWheel.bind (this));
			this.canvas.addEventListener ('touchstart', this.OnTouchStart.bind (this));
			this.canvas.addEventListener ('touchmove', this.OnTouchMove.bind (this));
			this.canvas.addEventListener ('touchend', this.OnTouchEnd.bind (this));
			this.canvas.addEventListener ('contextmenu', this.OnContextMenu.bind (this));
		}
		if (document.addEventListener) {
			document.addEventListener ('mousemove', this.OnMouseMove.bind (this));
			document.addEventListener ('mouseup', this.OnMouseUp.bind (this));
			document.addEventListener ('mouseleave', this.OnMouseLeave.bind (this));
		}
	}

	SetUpdateHandler (onUpdate)
	{
		this.onUpdate = onUpdate;
	}

	SetClickHandler (onClick)
	{
		this.onClick = onClick;
	}

	SetContextMenuHandler (onContext)
	{
		this.onContext = onContext;
	}

	IsFixUpVector ()
	{
		return this.fixUpVector;
	}

	SetFixUpVector (fixUpVector)
	{
		this.fixUpVector = fixUpVector;
	}

	GetCamera ()
	{
		return this.camera;
	}

	SetCamera (camera)
	{
		this.camera = camera;
	}

	MoveCamera (newCamera, stepCount)
	{
		function Step (obj, steps, count, index)
		{
			obj.camera.eye = steps.eye[index];
			obj.camera.center = steps.center[index];
			obj.camera.up = steps.up[index];
			obj.Update ();

			if (index < count - 1) {
				requestAnimationFrame (() => {
					Step (obj, steps, count, index + 1);
				});
			}
		}

		if (newCamera === null) {
			return;
		}

		if (stepCount === 0) {
			this.SetCamera (newCamera);
			return;
		}

		if (CoordIsEqual3D (this.camera.eye, newCamera.eye) &&
			CoordIsEqual3D (this.camera.center, newCamera.center) &&
			CoordIsEqual3D (this.camera.up, newCamera.up))
		{
			return;
		}

		let tweenFunc = ParabolicTweenFunction;
		let steps = {
			eye : TweenCoord3D (this.camera.eye, newCamera.eye, stepCount, tweenFunc),
			center : TweenCoord3D (this.camera.center, newCamera.center, stepCount, tweenFunc),
			up : TweenCoord3D (this.camera.up, newCamera.up, stepCount, tweenFunc)
		};
		requestAnimationFrame (() => {
			Step (this, steps, stepCount, 0);
		});
		this.Update ();
	}

	FitToSphere (center, radius, fov)
	{
		if (
			IsZero (radius)) {
			return;
		}

		let fitCamera = this.GetFitToSphereCamera (center, radius, fov);
		this.camera = fitCamera;

		this.orbitCenter = this.camera.center.Clone ();
		this.Update ();
	}

	GetFitToSphereCamera (center, radius, fov)
	{
		if (IsZero (radius)) {
			return null;
		}

		let fitCamera = this.camera.Clone ();

		let offsetToOrigo = SubCoord3D (fitCamera.center, center);
		fitCamera.eye = SubCoord3D (fitCamera.eye, offsetToOrigo);
		fitCamera.center = center.Clone ();

		let centerEyeDirection = SubCoord3D (fitCamera.eye, fitCamera.center).Normalize ();
		let fieldOfView = fov / 2.0;
		if (this.canvas.width < this.canvas.height) {
			fieldOfView = fieldOfView * this.canvas.width / this.canvas.height;
		}
		let distance = radius / Math.sin (fieldOfView * DegRad);

		fitCamera.eye = fitCamera.center.Clone ().Offset (centerEyeDirection, distance);
		this.orbitCenter = fitCamera.center.Clone ();
		return fitCamera;
	}

	OnMouseDown (ev)
	{
		ev.preventDefault ();

		this.mouse.Down (this.canvas, ev);
		this.clickDetector.Down (ev);
	}

	OnMouseMove (ev)
	{
		this.mouse.Move (this.canvas, ev);
		this.clickDetector.Move ();

		let mouseCoordinates = this.mouse.curr;
		//let meshUserData = this.viewer.GetMeshUserDataUnderMouse (mouseCoordinates);

		if (!this.mouse.IsButtonDown ()) {
			return;
		}

		let moveDiff = this.mouse.GetMoveDiff ();
		let mouseButton = this.mouse.GetButton ();

		let navigationType = NavigationType.None;
		if (mouseButton === 1) {
			if (ev.ctrlKey) {
				navigationType = NavigationType.Zoom;
			} else if (ev.shiftKey) {
				navigationType = NavigationType.Pan;
			} else {
				navigationType = NavigationType.Orbit;
			}
		} else if (mouseButton === 2 || mouseButton === 3) {
			navigationType = NavigationType.Pan;
		}

		if (navigationType === NavigationType.Orbit) {
			let orbitRatio = 0.5;
			this.Orbit (moveDiff.x * orbitRatio, moveDiff.y * orbitRatio);
		} else if (navigationType === NavigationType.Pan) {
			let eyeCenterDistance = CoordDistance3D (this.camera.eye, this.camera.center);
			let panRatio = 0.001 * eyeCenterDistance;
			this.Pan (moveDiff.x * panRatio, moveDiff.y * panRatio);
		} else if (navigationType === NavigationType.Zoom) {
			let zoomRatio = 0.005;
			this.Zoom (-moveDiff.y * zoomRatio);
		}

		this.Update ();
	}

	OnMouseUp (ev)
	{
		this.mouse.Up (this.canvas, ev);
		this.clickDetector.Up (ev);
		if (this.clickDetector.IsClick ()) {
			this.Click (ev.which, ev.clientX, ev.clientY);
		}
	}

	OnMouseLeave (ev)
	{
		this.mouse.Leave (this.canvas, ev);
		this.clickDetector.Leave ();
	}

	OnTouchStart (ev)
	{
		ev.preventDefault ();

		this.touch.Start (this.canvas, ev);
	}

	OnTouchMove (ev)
	{
		ev.preventDefault ();

		this.touch.Move (this.canvas, ev);
		if (!this.touch.IsFingerDown ()) {
			return;
		}

		let moveDiff = this.touch.GetMoveDiff ();
		let distanceDiff = this.touch.GetDistanceDiff ();
		let fingerCount = this.touch.GetFingerCount ();
		if (fingerCount === 1) {
			let orbitRatio = 0.5;
			this.Orbit (moveDiff.x * orbitRatio, moveDiff.y * orbitRatio);
		} else if (fingerCount === 2) {
			let zoomRatio = 0.005;
			this.Zoom (distanceDiff * zoomRatio);
			let panRatio = 0.001 * CoordDistance3D (this.camera.eye, this.camera.center);
			this.Pan (moveDiff.x * panRatio, moveDiff.y * panRatio);
		}

		this.Update ();
	}

	OnTouchEnd (ev)
	{
		ev.preventDefault ();

		this.touch.End (this.canvas, ev);
	}

	OnMouseWheel (ev)
	{
		ev.preventDefault ();

		let params = ev || window.event;

		let delta = -params.deltaY / 40;
		let ratio = 0.1;
		if (delta < 0) {
			ratio = ratio * -1.0;
		}

		this.Zoom (ratio);
		this.Update ();
	}

	OnContextMenu (ev)
	{
		ev.preventDefault ();

		this.clickDetector.Up (ev);
		if (this.clickDetector.IsClick ()) {
			this.Context (ev.clientX, ev.clientY);
		}
	}

	Orbit (angleX, angleY)
	{
		let radAngleX = angleX * DegRad;
		let radAngleY = angleY * DegRad;

		let viewDirection = SubCoord3D (this.camera.center, this.camera.eye).Normalize ();
		let horizontalDirection = CrossVector3D (viewDirection, this.camera.up).Normalize ();
		let differentCenter = !CoordIsEqual3D (this.orbitCenter, this.camera.center);

		if (this.fixUpVector) {
			let originalAngle = VectorAngle3D (viewDirection, this.camera.up);
			let newAngle = originalAngle + radAngleY;
			if (IsGreater (newAngle, 0.0) && IsLower (newAngle, Math.PI)) {
				this.camera.eye.Rotate (horizontalDirection, -radAngleY, this.orbitCenter);
				if (differentCenter) {
					this.camera.center.Rotate (horizontalDirection, -radAngleY, this.orbitCenter);
				}
			}
			this.camera.eye.Rotate (this.camera.up, -radAngleX, this.orbitCenter);
			if (differentCenter) {
				this.camera.center.Rotate (this.camera.up, -radAngleX, this.orbitCenter);
			}
		} else {
			let verticalDirection = CrossVector3D (horizontalDirection, viewDirection).Normalize ();
			this.camera.eye.Rotate (horizontalDirection, -radAngleY, this.orbitCenter);
			this.camera.eye.Rotate (verticalDirection, -radAngleX, this.orbitCenter);
			if (differentCenter) {
				this.camera.center.Rotate (horizontalDirection, -radAngleY, this.orbitCenter);
				this.camera.center.Rotate (verticalDirection, -radAngleX, this.orbitCenter);
			}
			this.camera.up = verticalDirection;
		}
	}

	Pan (moveX, moveY)
	{
		let viewDirection = SubCoord3D (this.camera.center, this.camera.eye).Normalize ();
		let horizontalDirection = CrossVector3D (viewDirection, this.camera.up).Normalize ();
		let verticalDirection = CrossVector3D (horizontalDirection, viewDirection).Normalize ();

		this.camera.eye.Offset (horizontalDirection, -moveX);
		this.camera.center.Offset (horizontalDirection, -moveX);

		this.camera.eye.Offset (verticalDirection, moveY);
		this.camera.center.Offset (verticalDirection, moveY);
	}

	Zoom (ratio)
	{
		let direction = SubCoord3D (this.camera.center, this.camera.eye);
		let distance = direction.Length ();
		let move = distance * ratio;
		this.camera.eye.Offset (direction, move);
	}

	Update ()
	{
		if (this.onUpdate) {
			this.onUpdate ();
		}
	}

	Click (button, clientX, clientY)
	{
		if (this.onClick) {
			let mouseCoords = GetClientCoordinates (this.canvas, clientX, clientY);
			this.onClick (button, mouseCoords);
		}
	}

	Context (clientX, clientY)
	{
		if (this.onContext) {
			let globalCoords = {
				x : clientX,
				y : clientY
			};
			let localCoords = GetClientCoordinates (this.canvas, clientX, clientY);
			this.onContext (globalCoords, localCoords);
		}
	}
};
