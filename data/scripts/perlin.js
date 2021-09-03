(function (t) {
	function o(t, o, r) {
		(this.x = t), (this.y = o), (this.z = r);
	}
	function r(t) {
		return t * t * t * (t * (6 * t - 15) + 10);
	}
	function n(t, o, r) {
		return (1 - r) * t + r * o;
	}
	var a = (t.noise = {});
	(o.prototype.dot2 = function (t, o) {
		return this.x * t + this.y * o;
	}),
		(o.prototype.dot3 = function (t, o, r) {
			return this.x * t + this.y * o + this.z * r;
		});
	var e = [
			new o(1, 1, 0),
			new o(-1, 1, 0),
			new o(1, -1, 0),
			new o(-1, -1, 0),
			new o(1, 0, 1),
			new o(-1, 0, 1),
			new o(1, 0, -1),
			new o(-1, 0, -1),
			new o(0, 1, 1),
			new o(0, -1, 1),
			new o(0, 1, -1),
			new o(0, -1, -1),
		],
		i = [
			151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7,
			225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6,
			148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35,
			11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171,
			168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231,
			83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245,
			40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76,
			132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
			164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5,
			202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16,
			58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
			154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253,
			19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246,
			97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
			81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199,
			106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
			138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78,
			66, 215, 61, 156, 180,
		],
		d = new Array(512),
		f = new Array(512);
	(a.seed = function (t) {
		t > 0 && t < 1 && (t *= 65536),
			(t = Math.floor(t)),
			t < 256 && (t |= t << 8);
		for (var o = 0; o < 256; o++) {
			var r;
			(r = 1 & o ? i[o] ^ (255 & t) : i[o] ^ ((t >> 8) & 255)),
				(d[o] = d[o + 256] = r),
				(f[o] = f[o + 256] = e[r % 12]);
		}
	}),
		a.seed(0);
	var h = 0.5 * (Math.sqrt(3) - 1),
		v = (3 - Math.sqrt(3)) / 6,
		u = 1 / 3,
		s = 1 / 6;
	(a.simplex2 = function (t, o) {
		var r,
			n,
			a,
			e,
			i,
			u = (t + o) * h,
			s = Math.floor(t + u),
			l = Math.floor(o + u),
			w = (s + l) * v,
			M = t - s + w,
			c = o - l + w;
		M > c ? ((e = 1), (i = 0)) : ((e = 0), (i = 1));
		var p = M - e + v,
			y = c - i + v,
			x = M - 1 + 2 * v,
			m = c - 1 + 2 * v;
		(s &= 255), (l &= 255);
		var q = f[s + d[l]],
			z = f[s + e + d[l + i]],
			A = f[s + 1 + d[l + 1]],
			b = 0.5 - M * M - c * c;
		b < 0 ? (r = 0) : ((b *= b), (r = b * b * q.dot2(M, c)));
		var g = 0.5 - p * p - y * y;
		g < 0 ? (n = 0) : ((g *= g), (n = g * g * z.dot2(p, y)));
		var j = 0.5 - x * x - m * m;
		return (
			j < 0 ? (a = 0) : ((j *= j), (a = j * j * A.dot2(x, m))),
			70 * (r + n + a)
		);
	}),
		(a.simplex3 = function (t, o, r) {
			var n,
				a,
				e,
				i,
				h,
				v,
				l,
				w,
				M,
				c,
				p = (t + o + r) * u,
				y = Math.floor(t + p),
				x = Math.floor(o + p),
				m = Math.floor(r + p),
				q = (y + x + m) * s,
				z = t - y + q,
				A = o - x + q,
				b = r - m + q;
			z >= A
				? A >= b
					? ((h = 1), (v = 0), (l = 0), (w = 1), (M = 1), (c = 0))
					: z >= b
					? ((h = 1), (v = 0), (l = 0), (w = 1), (M = 0), (c = 1))
					: ((h = 0), (v = 0), (l = 1), (w = 1), (M = 0), (c = 1))
				: A < b
				? ((h = 0), (v = 0), (l = 1), (w = 0), (M = 1), (c = 1))
				: z < b
				? ((h = 0), (v = 1), (l = 0), (w = 0), (M = 1), (c = 1))
				: ((h = 0), (v = 1), (l = 0), (w = 1), (M = 1), (c = 0));
			var g = z - h + s,
				j = A - v + s,
				k = b - l + s,
				B = z - w + 2 * s,
				C = A - M + 2 * s,
				D = b - c + 2 * s,
				E = z - 1 + 3 * s,
				F = A - 1 + 3 * s,
				G = b - 1 + 3 * s;
			(y &= 255), (x &= 255), (m &= 255);
			var H = f[y + d[x + d[m]]],
				I = f[y + h + d[x + v + d[m + l]]],
				J = f[y + w + d[x + M + d[m + c]]],
				K = f[y + 1 + d[x + 1 + d[m + 1]]],
				L = 0.6 - z * z - A * A - b * b;
			L < 0 ? (n = 0) : ((L *= L), (n = L * L * H.dot3(z, A, b)));
			var N = 0.6 - g * g - j * j - k * k;
			N < 0 ? (a = 0) : ((N *= N), (a = N * N * I.dot3(g, j, k)));
			var O = 0.6 - B * B - C * C - D * D;
			O < 0 ? (e = 0) : ((O *= O), (e = O * O * J.dot3(B, C, D)));
			var P = 0.6 - E * E - F * F - G * G;
			return (
				P < 0 ? (i = 0) : ((P *= P), (i = P * P * K.dot3(E, F, G))),
				32 * (n + a + e + i)
			);
		}),
		(a.perlin2 = function (t, o) {
			var a = Math.floor(t),
				e = Math.floor(o);
			(t -= a), (o -= e), (a &= 255), (e &= 255);
			var i = f[a + d[e]].dot2(t, o),
				h = f[a + d[e + 1]].dot2(t, o - 1),
				v = f[a + 1 + d[e]].dot2(t - 1, o),
				u = f[a + 1 + d[e + 1]].dot2(t - 1, o - 1),
				s = r(t);
			return n(n(i, v, s), n(h, u, s), r(o));
		}),
		(a.perlin3 = function (t, o, a) {
			var e = Math.floor(t),
				i = Math.floor(o),
				h = Math.floor(a);
			(t -= e), (o -= i), (a -= h), (e &= 255), (i &= 255), (h &= 255);
			var v = f[e + d[i + d[h]]].dot3(t, o, a),
				u = f[e + d[i + d[h + 1]]].dot3(t, o, a - 1),
				s = f[e + d[i + 1 + d[h]]].dot3(t, o - 1, a),
				l = f[e + d[i + 1 + d[h + 1]]].dot3(t, o - 1, a - 1),
				w = f[e + 1 + d[i + d[h]]].dot3(t - 1, o, a),
				M = f[e + 1 + d[i + d[h + 1]]].dot3(t - 1, o, a - 1),
				c = f[e + 1 + d[i + 1 + d[h]]].dot3(t - 1, o - 1, a),
				p = f[e + 1 + d[i + 1 + d[h + 1]]].dot3(t - 1, o - 1, a - 1),
				y = r(t),
				x = r(o),
				m = r(a);
			return n(
				n(n(v, w, y), n(u, M, y), m),
				n(n(s, c, y), n(l, p, y), m),
				x
			);
		});
})(this);

noise.seed(Math.random());
