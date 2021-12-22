var assert = require ('assert');
const {Box3D} = require("../../source/geometry/box3d");
const {Octree} = require("../../source/geometry/octree");
const {TweenCoord3D} = require("../../source/geometry/tween");
const {ParabolicTweenFunction} = require("../../source/geometry/tween");
const {BezierTweenFunction} = require("../../source/geometry/tween");
const {LinearTweenFunction} = require("../../source/geometry/tween");
const {CoordIsEqual3D} = require("../../source/geometry/coord3d");
const {Transformation} = require("../../source/geometry/transformation");
const {QuaternionFromAxisAngle} = require("../../source/geometry/quaternion");
const {CalculateTriangleNormal} = require("../../source/model/modelutils");
const {Coord3D} = require("../../source/geometry/coord3d");
const {IsLower} = require("../../source/geometry/geometry");
const {IsGreaterOrEqual} = require("../../source/geometry/geometry");
const {IsGreater} = require("../../source/geometry/geometry");
const {IsEqual} = require("../../source/geometry/geometry");
const Matrix = require("../../source/geometry/matrix");

function SeededRandom (from, to, seed)
{
    var random = ((seed * 9301 + 49297) % 233280) / 233280;
	return random * (to - from) + from;
}

describe ('Comparison', function () {
    it ('IsEqual', function () {
        assert (IsEqual (1.0, 1.0));
        assert (IsEqual (1.0, 1.000000001));
        assert (!IsEqual (1.0, 1.0001));
    });

    it ('IsGreater', function () {
        assert (IsGreater (1.0, 0.0));
        assert (IsGreater (1.0001, 1.0));
        assert (!IsGreater (1.000000001, 1.0));

        assert (IsGreaterOrEqual (1.0001, 1.0));
        assert (IsGreaterOrEqual (1.000000001, 1.0));
        assert (IsGreaterOrEqual (0.999999999, 1.0));
        assert (!IsGreaterOrEqual (0.999, 1.0));
    });

    it ('IsLower', function () {
        assert (IsLower (0.0, 1.0));
        assert (IsLower (1.0, 1.0001));
        assert (!IsLower (1.0, 1.000000001));

        assert (IsLowerOrEqual (1.0, 1.0001));
        assert (IsLowerOrEqual (1.0, 1.000000001));
        assert (IsLowerOrEqual (1.0, 0.999999999));
        assert (!IsLowerOrEqual (1.0, 0.999));
    });
});


describe ('Coord', function () {
    it ('Length', function () {
        var c = new Coord3D (2.0, 0.0, 0.0);
        assert.strictEqual (c.Length (), 2.0);
    });

    it ('Multiply Scalar', function () {
        var c = new Coord3D (2.0, 0.0, 0.0);
        c.MultiplyScalar (3.0);
        assert.strictEqual (c.x, 6.0);
        assert.strictEqual (c.y, 0.0);
        assert.strictEqual (c.z, 0.0);
    });

    it ('Normalize', function () {
        var c = new Coord3D (2.0, 0.0, 0.0);
        c.Normalize ();
        assert.strictEqual (c.x, 1.0);
        assert.strictEqual (c.y, 0.0);
        assert.strictEqual (c.z, 0.0);
    });
});

describe ('Triangle', function() {
    it ('Calculate Normal', function () {
        var normal = CalculateTriangleNormal (
            new Coord3D (0.0, 0.0, 0.0),
            new Coord3D (1.0, 0.0, 0.0),
            new Coord3D (1.0, 1.0, 0.0)
        );
        assert.strictEqual (normal.x, 0.0);
        assert.strictEqual (normal.y, 0.0);
        assert.strictEqual (normal.z, 1.0);
    });
});

describe ('Transformation', function() {
    it ('Basic Test', function () {
        let rotation = QuaternionFromAxisAngle (new Coord3D (0.0, 1.0, 0.0), Math.PI / 2.0);

        let coord = new Coord3D (1.0, 2.0, 3.0);

        let tr = new Transformation ();
        assert (tr.IsIdentity ());
        assert (CoordIsEqual3D (tr.TransformCoord3D (coord), new Coord3D (1.0, 2.0, 3.0)));

        tr.AppendMatrix (new Matrix ().CreateScale (3.0, 4.0, 5.0));
        assert (!tr.IsIdentity ());
        assert (CoordIsEqual3D (tr.TransformCoord3D (coord), new Coord3D (3.0, 8.0, 15.0)));

        tr.AppendMatrix (new Matrix ().CreateRotation (rotation.x, rotation.y, rotation.z, rotation.w));
        assert (!tr.IsIdentity ());
        assert (CoordIsEqual3D (tr.TransformCoord3D (coord), new Coord3D (15.0, 8.0, -3.0)));

        tr.AppendMatrix (new Matrix ().CreateTranslation (4.0, 5.0, 6.0));
        assert (!tr.IsIdentity ());
        assert (CoordIsEqual3D (tr.TransformCoord3D (coord), new Coord3D (19.0, 13.0, 3.0)));

        let tr2 = new Transformation ();
        tr2.SetMatrix (new Matrix ().ComposeTRS (new Coord3D (4.0, 5.0, 6.0), rotation, new Coord3D (3.0, 4.0, 5.0)));
        assert (CoordIsEqual3D (tr2.TransformCoord3D (coord), new Coord3D (19.0, 13.0, 3.0)));
    });

    it ('Append Test', function () {
        let coord = new Coord3D (1.0, 2.0, 3.0);

        let tr = new Transformation ();
        assert (tr.IsIdentity ());
        assert (CoordIsEqual3D (tr.TransformCoord3D (coord), new Coord3D (1.0, 2.0, 3.0)));

        let tr2 = new Transformation (new Matrix ().CreateScale (3.0, 4.0, 5.0));
        tr.Append (tr2);
        assert (!tr.IsIdentity ());
        assert (CoordIsEqual3D (tr.TransformCoord3D (coord), new Coord3D (3.0, 8.0, 15.0)));
    });

    it ('TRS Compose Test', function () {
        let rotation = QuaternionFromAxisAngle (new Coord3D (0.0, 1.0, 0.0), Math.PI / 2.0);
        let coord = new Coord3D (1.0, 2.0, 3.0);

        let tr = new Transformation ();
        tr.SetMatrix (new Matrix ().ComposeTRS (new Coord3D (4.0, 5.0, 6.0), rotation, new Coord3D (3.0, 4.0, 5.0)));
        assert (CoordIsEqual3D (tr.TransformCoord3D (coord), new Coord3D (19.0, 13.0, 3.0)));
    });

    it ('TRS Compose Test 2', function () {
        let rotation = QuaternionFromAxisAngle (new Coord3D (0.0, 1.0, 0.0), Math.PI / 2.0);
        let coord = new Coord3D (1.0, 2.0, 3.0);

        let tr = new Transformation ();
        tr.SetMatrix (new Matrix ().ComposeTRS (new Coord3D (4.0, 5.0, 6.0), rotation, new Coord3D (3.0, 4.0, 5.0)));
        assert (CoordIsEqual3D (tr.TransformCoord3D (coord), new Coord3D (19.0, 13.0, 3.0)));

        let trs = tr.GetMatrix ().DecomposeTRS ();
        let tr2 = new Transformation ();
        tr2.SetMatrix (new Matrix ().ComposeTRS (trs.translation, trs.rotation, trs.scale));
        assert (CoordIsEqual3D (tr2.TransformCoord3D (coord), new Coord3D (19.0, 13.0, 3.0)));
    });

    it ('Default Quaternion Test', function () {
        let coord = new Coord3D (1.0, 2.0, 3.0);

        let tr = new Transformation ();
        tr.SetMatrix (new Matrix ().CreateRotation (0.0, 0.0, 0.0, 1.0));
        assert (CoordIsEqual3D (tr.TransformCoord3D (coord), coord));
    });

    it ('Clone Test', function () {
        let tr = new Transformation ();
        let cloned = tr.Clone ();
        tr.matrix.matrix[0] = 5.0;
        assert.strictEqual (cloned.matrix.matrix[0], 1.0);
    });
});

describe ('Tween', function() {
    it ('Linear Tween Function', function () {
        assert (IsEqual (LinearTweenFunction (10.0, 0, 10), 0.0));
        assert (IsEqual (LinearTweenFunction (10.0, 1, 10), 1.0));
        assert (IsEqual (LinearTweenFunction (10.0, 5, 10), 5.0));
        assert (IsEqual (LinearTweenFunction (10.0, 9, 10), 9.0));
        assert (IsEqual (LinearTweenFunction (10.0, 10, 10), 10.0));
    });

    it ('Bezier Tween Function', function () {
        assert (IsEqual (BezierTweenFunction (10.0, 0, 10), 0.0));
        assert (IsEqual (BezierTweenFunction (10.0, 1, 10), 0.28));
        assert (IsEqual (BezierTweenFunction (10.0, 5, 10), 5.0));
        assert (IsEqual (BezierTweenFunction (10.0, 9, 10), 9.72));
        assert (IsEqual (BezierTweenFunction (10.0, 10, 10), 10.0));
    });

    it ('Parabolic Tween Function', function () {
        assert (IsEqual (ParabolicTweenFunction (10.0, 0, 10), 0.0));
        assert (IsEqual (ParabolicTweenFunction (10.0, 5, 10), 5.0));
        assert (IsEqual (ParabolicTweenFunction (10.0, 10, 10), 10.0));
    });

    it ('Linear Tween Coordinates', function () {
        let beg = new Coord3D (0.0, 0.0, 0.0);
        let end = new Coord3D (9.0, 0.0, 0.0);
        let segments = TweenCoord3D (beg, end, 10, LinearTweenFunction);
        assert.strictEqual (segments.length, 10);
        assert (CoordIsEqual3D (segments[0], beg));
        assert (CoordIsEqual3D (segments[1], new Coord3D (1.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (segments[5], new Coord3D (5.0, 0.0, 0.0)));
        assert (CoordIsEqual3D (segments[segments.length - 1], end));
    });
});

describe ('Octree', function() {
    it ('Add Point', function () {
        let octree = new Octree (new Box3D (
            new Coord3D (-10.0, -10.0, -10.0),
            new Coord3D (10.0, 10.0, 10.0)
        ));

        let p1 = new Coord3D (0.0, 0.0, 0.0);
        assert (octree.AddPoint (p1, 'p1'));
        assert (!octree.AddPoint (p1, 'p2'));
        assert.strictEqual (octree.FindPoint (p1), 'p1')
    });

    it ('Add Points', function () {
        let octree = new Octree (new Box3D (
            new Coord3D (-10.0, -10.0, -10.0),
            new Coord3D (10.0, 10.0, 10.0)
        ));

        let p1 = new Coord3D (0.0, 0.0, 0.0);
        let p2 = new Coord3D (1.0, 1.0, 1.0);
        let p3 = new Coord3D (-1.0, 1.0, 1.0);
        let p4 = new Coord3D (-1.0, -1.0, 1.0);
        let p5 = new Coord3D (-1.0, -1.0, -1.0);
        let p6 = new Coord3D (2.0, 2.0, 2.0);
        let p7 = new Coord3D (-2.0, 2.0, 2.0);
        let p8 = new Coord3D (-2.0, -2.0, 2.0);
        let p9 = new Coord3D (-2.0, -2.0, -2.0);

        assert (octree.AddPoint (p1, 'p1'));
        assert (octree.AddPoint (p2, 'p2'));
        assert (octree.AddPoint (p3, 'p3'));
        assert (octree.AddPoint (p4, 'p4'));
        assert (octree.AddPoint (p5, 'p5'));
        assert (octree.AddPoint (p6, 'p6'));
        assert (octree.AddPoint (p7, 'p7'));
        assert (octree.AddPoint (p8, 'p8'));
        assert (octree.AddPoint (p9, 'p9'));

        assert.strictEqual (octree.FindPoint (p1), 'p1');
        assert.strictEqual (octree.FindPoint (p2), 'p2');
        assert.strictEqual (octree.FindPoint (p3), 'p3');
        assert.strictEqual (octree.FindPoint (p4), 'p4');
        assert.strictEqual (octree.FindPoint (p5), 'p5');
        assert.strictEqual (octree.FindPoint (p6), 'p6');
        assert.strictEqual (octree.FindPoint (p7), 'p7');
        assert.strictEqual (octree.FindPoint (p8), 'p8');
        assert.strictEqual (octree.FindPoint (p9), 'p9');
    });

    it ('Add Points On Boundaries', function () {
        let octree = new Octree (new Box3D (
            new Coord3D (-10.0, -10.0, -10.0),
            new Coord3D (10.0, 10.0, 10.0)
        ));

        let p1 = new Coord3D (10.0, 10.0, 10.0);
        let p2 = new Coord3D (-10.0, -10.0, -10.0);
        let p3 = new Coord3D (20.0, 20.0, 20.0);

        assert (octree.AddPoint (p1, 'p1'));
        assert (octree.AddPoint (p2, 'p2'));
        assert (!octree.AddPoint (p3, 'p3'));

        assert.strictEqual (octree.FindPoint (p1), 'p1');
        assert.strictEqual (octree.FindPoint (p2), 'p2');
        assert.strictEqual (octree.FindPoint (p3), null);
    });

    it ('Stress Test', function () {
        let box = new Box3D (
            new Coord3D (-10.0, -10.0, -10.0),
            new Coord3D (10.0, 10.0, 10.0)
        );

        let octree = new Octree (box);

        let count = 1000;
        let seed = 1;
        let points = [];
        for (let i = 0; i < count; i++) {
            let x = SeededRandom (-10.0, 10.0, seed++);
            let y = SeededRandom (-10.0, 10.0, seed++);
            let z = SeededRandom (-10.0, 10.0, seed++);
            let point = new Coord3D (x, y, z);
            points.push (point);
        }
        for (let i = 0; i < count; i++) {
            let point = points[i];
            assert (octree.AddPoint (point, i.toString ()));
        }
        for (let i = 0; i < count; i++) {
            let point = points[i];
            assert.strictEqual (octree.FindPoint (point), i.toString ());
        }
    });
});
