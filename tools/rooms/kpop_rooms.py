# Draws the K-pop Academy's new rooms as SVG (1600 x 700 room units = the 1920 x 840 painted-room format).
import math
W, H = 1600, 700
INK = '#3B2B5A'

def floor_boards(h, c1, c2, line, vp=(800, -500), n=34, rows=9):
    s = f'<rect x="0" y="{h}" width="{W}" height="{H-h}" fill="url(#floorG)"/>'
    # planks converging to the vanishing point
    for i in range(-6, n + 7):
        xb = i * (W / n)
        t = (h - vp[1]) / (H - vp[1])
        xt = vp[0] + (xb - vp[0]) * t
        s += f'<line x1="{xt:.1f}" y1="{h}" x2="{xb:.1f}" y2="{H}" stroke="{line}" stroke-width="2" opacity=".5"/>'
    y = h; k = 14
    for r in range(rows):
        y += k; k *= 1.32
        if y > H: break
        s += f'<line x1="0" y1="{y:.1f}" x2="{W}" y2="{y:.1f}" stroke="{line}" stroke-width="1.5" opacity=".35"/>'
    # shine
    s += f'<ellipse cx="800" cy="{h+150}" rx="520" ry="70" fill="#fff" opacity=".18"/>'
    return s

def defs(wall1, wall2, floor1, floor2):
    return f'''<defs>
<linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{wall1}"/><stop offset="1" stop-color="{wall2}"/></linearGradient>
<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{floor1}"/><stop offset="1" stop-color="{floor2}"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6C8" stop-opacity=".75"/><stop offset="1" stop-color="#FFF6C8" stop-opacity="0"/></linearGradient>
<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BFE6FF" stop-opacity=".55"/><stop offset=".5" stop-color="#E9F7FF" stop-opacity=".25"/><stop offset="1" stop-color="#BFE6FF" stop-opacity=".5"/></linearGradient>
</defs>'''

def plant(x, y, s=1.0):
    leaves = ''.join(f'<path d="M0 0 Q{dx*0.5} {-60*s} {dx} {-95*s} Q{dx*0.2} {-55*s} 0 0Z" fill="{c}" stroke="#2E7D4F" stroke-width="2"/>'
                     for dx, c in [(-55*s, '#5DBB63'), (55*s, '#4CAF50'), (-20*s, '#6CCB6E'), (25*s, '#58B85C'), (0, '#7AD47C')])
    return f'<g transform="translate({x} {y})">{leaves}<path d="M{-30*s} 0 h{60*s} l{-8*s} {50*s} h{-44*s}z" fill="#FFFFFF" stroke="{INK}" stroke-width="3"/></g>'

def speaker(x, y, s=1.0):
    return (f'<g transform="translate({x} {y}) scale({s})"><rect x="-38" y="-110" width="76" height="110" rx="10" fill="#2F2A3D" stroke="{INK}" stroke-width="3"/>'
            f'<circle cx="0" cy="-75" r="16" fill="#46405C"/><circle cx="0" cy="-75" r="7" fill="#1E1A2A"/><circle cx="0" cy="-32" r="24" fill="#46405C"/><circle cx="0" cy="-32" r="11" fill="#1E1A2A"/></g>')

def string_lights(x1, x2, y, sag=30, n=16, colors=('#FFD45C', '#FF8FB8', '#9BE7FF', '#C7A6FF')):
    s = f'<path d="M{x1} {y} Q{(x1+x2)/2} {y+sag*2} {x2} {y}" fill="none" stroke="#6B5A7E" stroke-width="2"/>'
    for i in range(n + 1):
        t = i / n; x = x1 + (x2 - x1) * t; yy = (1-t)**2*y + 2*(1-t)*t*(y+sag*2) + t*t*y
        c = colors[i % len(colors)]
        s += f'<circle cx="{x:.1f}" cy="{yy+8:.1f}" r="14" fill="url(#glow)" opacity=".7"/><ellipse cx="{x:.1f}" cy="{yy+8:.1f}" rx="5" ry="7" fill="{c}" stroke="#6B5A7E" stroke-width="1"/>'
    return s

def star(cx, cy, r, fill, stroke=INK, sw=3):
    pts = ' '.join(f'{cx + (r if k%2==0 else r*0.45)*math.sin(k*math.pi/5):.1f},{cy - (r if k%2==0 else r*0.45)*math.cos(k*math.pi/5):.1f}' for k in range(10))
    return f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>'

def heart(cx, cy, r, fill, stroke=INK, sw=3):
    return f'<path d="M{cx} {cy+r*0.9} C{cx-r*1.6} {cy-r*0.1} {cx-r*0.9} {cy-r*1.3} {cx} {cy-r*0.45} C{cx+r*0.9} {cy-r*1.3} {cx+r*1.6} {cy-r*0.1} {cx} {cy+r*0.9}Z" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>'

def wrap(body, d):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="1920" height="840">{d}{body}</svg>'

# ── Recording booth ────────────────────────────────
def booth():
    h = 470
    d = defs('#D8C6F2', '#C4AEE8', '#7E6A9E', '#5E4D7E')
    s = f'<rect width="{W}" height="{h}" fill="url(#wallG)"/>'
    # acoustic foam panels on both sides
    for (x0, x1) in [(0, 500), (1100, 1600)]:
        for cx in range(x0 + 20, x1 - 40, 78):
            for cy in range(40, h - 120, 78):
                col = '#9C86C9' if (cx // 78 + cy // 78) % 2 else '#AE98D8'
                s += f'<rect x="{cx}" y="{cy}" width="68" height="68" rx="12" fill="{col}" stroke="#7D67AC" stroke-width="2"/>'
                s += f'<path d="M{cx+10} {cy+20} h48 M{cx+10} {cy+34} h48 M{cx+10} {cy+48} h48" stroke="#8A74B8" stroke-width="3" stroke-linecap="round"/>'
    # big window into the control room
    s += f'<rect x="520" y="70" width="560" height="300" rx="22" fill="#4A3F66" stroke="{INK}" stroke-width="6"/>'
    s += f'<rect x="540" y="90" width="520" height="260" rx="14" fill="#2C2442"/>'
    # control room: mixing desk, screens, small speakers, lamp glow
    s += f'<ellipse cx="800" cy="140" rx="220" ry="70" fill="#FFB3D9" opacity=".18"/>'
    for i, x in enumerate([600, 740, 880]):
        s += f'<rect x="{x}" y="130" width="120" height="78" rx="8" fill="#1B1730" stroke="#5E5480" stroke-width="3"/>'
        for k in range(6):
            hh = 10 + ((i * 7 + k * 13) % 40)
            s += f'<rect x="{x+12+k*17}" y="{196-hh}" width="10" height="{hh}" rx="2" fill="{["#7FE3FF","#FF8FB8","#B9F27C"][i]}"/>'
    s += f'<path d="M560 330 L620 250 H980 L1040 330Z" fill="#3E365A" stroke="#5E5480" stroke-width="3"/>'
    for k in range(18):
        x = 640 + k * 18
        s += f'<rect x="{x}" y="{262 + (k%3)*8}" width="8" height="26" rx="3" fill="#6E6596"/><circle cx="{x+4}" cy="{268 + (k*7)%20}" r="5" fill="{["#FFD45C","#FF8FB8","#7FE3FF"][k%3]}"/>'
    s += speaker(575, 245, .55) + speaker(1025, 245, .55)
    # glass shine
    s += f'<rect x="540" y="90" width="520" height="260" rx="14" fill="url(#glass)"/>'
    s += f'<path d="M600 92 L680 92 L580 348 L540 348 L540 240Z" fill="#fff" opacity=".12"/><path d="M720 92 L760 92 L660 348 L620 348Z" fill="#fff" opacity=".10"/>'
    # ON AIR sign
    s += f'<rect x="700" y="18" width="200" height="44" rx="12" fill="#FF4F7B" stroke="{INK}" stroke-width="4"/>'
    s += f'<rect x="680" y="0" width="240" height="80" rx="30" fill="#FF4F7B" opacity=".18"/>'
    s += f'<text x="800" y="50" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="28" fill="#fff" letter-spacing="3">ON AIR</text>'
    # gold records on the left wall, music notes on the right
    for i, (x, y) in enumerate([(160, 120), (300, 120), (230, 250)]):
        s += f'<rect x="{x-58}" y="{y-58}" width="116" height="116" rx="10" fill="#FFF6E2" stroke="{INK}" stroke-width="4"/>'
        s += f'<circle cx="{x}" cy="{y}" r="44" fill="#F2B632" stroke="#B9831A" stroke-width="3"/><circle cx="{x}" cy="{y}" r="30" fill="none" stroke="#FFE08A" stroke-width="2"/><circle cx="{x}" cy="{y}" r="9" fill="#FF8FB8" stroke="#B9831A" stroke-width="2"/>'
    for (x, y, c) in [(1230, 110, '#FF8FB8'), (1380, 170, '#7FE3FF'), (1300, 270, '#FFD45C'), (1460, 90, '#B9F27C')]:
        s += f'<g transform="translate({x} {y})"><path d="M0 0 v-60 l40 -12 v58" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round"/><ellipse cx="-10" cy="2" rx="16" ry="12" fill="{c}" stroke="{INK}" stroke-width="4"/><ellipse cx="30" cy="-10" rx="16" ry="12" fill="{c}" stroke="{INK}" stroke-width="4"/></g>'
    # skirting + floor
    s += f'<rect x="0" y="{h-14}" width="{W}" height="14" fill="#8F79BD"/>'
    s += floor_boards(h, '#7E6A9E', '#5E4D7E', '#4A3C66')
    # round rug in the middle of the booth
    s += f'<ellipse cx="800" cy="{h+130}" rx="300" ry="78" fill="#F7B6D6" stroke="#D987B2" stroke-width="5"/><ellipse cx="800" cy="{h+130}" rx="230" ry="56" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-dasharray="14 12" opacity=".8"/>'
    # warm string lights and plants at the edges
    s += string_lights(20, 1580, 8, sag=14, n=26)
    s += plant(470, h + 10, 0.9) + plant(1130, h + 10, 0.9)
    return wrap(s, d)

# ── Dressing room ──────────────────────────────────
def dressing():
    h = 470
    d = defs('#FFE1EE', '#FFCFE3', '#FFF3F8', '#F6D6E6')
    s = f'<rect width="{W}" height="{h}" fill="url(#wallG)"/>'
    for x in range(0, W, 60):   # soft stripes
        s += f'<rect x="{x}" y="0" width="28" height="{h}" fill="#FFFFFF" opacity=".28"/>'
    # long mirror with light bulbs (centre)
    s += f'<rect x="470" y="70" width="660" height="250" rx="26" fill="#FFF6E2" stroke="{INK}" stroke-width="6"/>'
    s += f'<rect x="500" y="100" width="600" height="190" rx="14" fill="#D9F0FF"/><rect x="500" y="100" width="600" height="190" rx="14" fill="url(#glass)"/>'
    s += f'<path d="M560 102 L640 102 L560 288 L502 288 L502 230Z" fill="#fff" opacity=".45"/><path d="M700 102 L740 102 L660 288 L620 288Z" fill="#fff" opacity=".3"/>'
    for k in range(13):
        x = 495 + k * 50
        for y in (84,):
            s += f'<circle cx="{x}" cy="{y}" r="22" fill="url(#glow)"/><circle cx="{x}" cy="{y}" r="10" fill="#FFF3B0" stroke="#E8B84A" stroke-width="2"/>'
    for y in range(120, 300, 46):
        for x in (484, 1116):
            s += f'<circle cx="{x}" cy="{y}" r="22" fill="url(#glow)"/><circle cx="{x}" cy="{y}" r="10" fill="#FFF3B0" stroke="#E8B84A" stroke-width="2"/>'
    # long make-up counter under the mirror
    s += f'<rect x="450" y="320" width="700" height="34" rx="10" fill="#FFFFFF" stroke="{INK}" stroke-width="5"/>'
    s += f'<rect x="470" y="354" width="660" height="{h-354}" fill="#F7C6DD" stroke="{INK}" stroke-width="5"/>'
    for k in range(4):
        x = 490 + k * 165
        s += f'<rect x="{x}" y="368" width="145" height="{h-384}" rx="8" fill="#FBD7E8" stroke="#E2A3C3" stroke-width="3"/><circle cx="{x+72}" cy="{368+(h-384)/2}" r="7" fill="#F2B632" stroke="{INK}" stroke-width="2"/>'
    # things on the counter
    s += f'<rect x="520" y="282" width="26" height="40" rx="6" fill="#B9A3F0" stroke="{INK}" stroke-width="3"/><rect x="556" y="292" width="20" height="30" rx="5" fill="#7FD8B5" stroke="{INK}" stroke-width="3"/>'
    s += f'<path d="M1040 322 q-8 -40 22 -46 q30 6 22 46z" fill="#FFB3D9" stroke="{INK}" stroke-width="3"/><circle cx="1062" cy="268" r="8" fill="#FF5D8F"/>'
    s += f'<rect x="760" y="296" width="80" height="26" rx="8" fill="#FF8FB8" stroke="{INK}" stroke-width="3"/>'
    for k, c in enumerate(['#FF5D8F', '#FFD45C', '#7FE3FF', '#B9A3F0', '#5FE0B7']):
        s += f'<rect x="{770+k*13}" y="300" width="9" height="18" rx="2" fill="{c}"/>'
    # left: clothes rail with stage outfits
    s += f'<rect x="40" y="110" width="380" height="12" rx="6" fill="#C9A35A" stroke="{INK}" stroke-width="3"/>'
    s += f'<rect x="52" y="110" width="12" height="{h-110}" fill="#C9A35A" stroke="{INK}" stroke-width="3"/><rect x="396" y="110" width="12" height="{h-110}" fill="#C9A35A" stroke="{INK}" stroke-width="3"/>'
    outfits = ['#FF5D8F', '#7FE3FF', '#FFD45C', '#B9A3F0', '#2F2A3D', '#5FE0B7', '#FF8A3D']
    for k, c in enumerate(outfits):
        x = 90 + k * 46
        s += f'<path d="M{x} 116 q8 -18 16 0" fill="none" stroke="#8A7A99" stroke-width="3"/>'
        long = k % 2 == 0
        hh = 190 if long else 120
        s += f'<path d="M{x-20} 126 h56 l{10 if long else 4} {hh} h{-76 if long else -64} z" fill="{c}" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'
        s += star(x + 8, 170, 9, '#FFFFFF', INK, 1.5) if k % 3 == 0 else heart(x + 8, 172, 8, '#FFFFFF', INK, 1.5)
    # shoe shelf under the rail
    s += f'<rect x="64" y="{h-48}" width="332" height="10" fill="#E8C98A" stroke="{INK}" stroke-width="2"/>'
    for k, c in enumerate(['#FF5D8F', '#FFFFFF', '#2F2A3D', '#FFD45C', '#7FE3FF']):
        s += f'<path d="M{86+k*62} {h-50} q0 -22 18 -22 q8 12 26 14 q8 2 8 8z" fill="{c}" stroke="{INK}" stroke-width="2.5"/>'
    # right: star door with a name plate + poster wall
    s += f'<rect x="1220" y="120" width="190" height="{h-120}" rx="12" fill="#FFF6E2" stroke="{INK}" stroke-width="6"/>'
    s += star(1315, 220, 50, '#FFD45C', INK, 4) + f'<circle cx="1390" cy="{h-170}" r="10" fill="#F2B632" stroke="{INK}" stroke-width="3"/>'
    s += f'<rect x="1245" y="290" width="140" height="44" rx="10" fill="#FF8FB8" stroke="{INK}" stroke-width="3"/><text x="1315" y="320" text-anchor="middle" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="800" font-size="22" fill="#fff">STARS</text>'
    for (x, y, c, shape) in [(1470, 110, '#B9A3F0', 'h'), (1530, 220, '#7FE3FF', 's'), (1460, 300, '#FFD45C', 'h')]:
        s += f'<rect x="{x-44}" y="{y-56}" width="88" height="112" rx="8" fill="{c}" stroke="{INK}" stroke-width="4"/>'
        s += heart(x, y - 4, 20, '#FFFFFF', INK, 2) if shape == 'h' else star(x, y, 26, '#FFFFFF', INK, 2)
    # skirting + floor (pink and white checks)
    s += f'<rect x="0" y="{h-12}" width="{W}" height="12" fill="#F2A7C8"/>'
    s += f'<rect x="0" y="{h}" width="{W}" height="{H-h}" fill="url(#floorG)"/>'
    vp = (800, -500); n = 20
    for r in range(8):
        y0 = h + 230 * ((r / 8) ** 1.5); y1 = h + 230 * (((r + 1) / 8) ** 1.5)
        for i in range(-8, n + 8):
            if (i + r) % 2: continue
            def xat(xb, y): t = (y - vp[1]) / (H - vp[1]); return vp[0] + (xb - vp[0]) * t
            xa, xb = i * W / n, (i + 1) * W / n
            s += f'<polygon points="{xat(xa,y0):.1f},{y0:.1f} {xat(xb,y0):.1f},{y0:.1f} {xat(xb,y1):.1f},{y1:.1f} {xat(xa,y1):.1f},{y1:.1f}" fill="#F7BCD6" opacity=".55"/>'
    s += f'<ellipse cx="800" cy="{h+120}" rx="520" ry="60" fill="#fff" opacity=".25"/>'
    s += plant(1180, h + 6, 0.8) + plant(1570, h + 30, 1.0)
    return wrap(s, d)

# ── Stage ──────────────────────────────────────────
def stage():
    h = 470
    d = defs('#3A2470', '#24164F', '#5B3B8E', '#3C2468')
    s = f'<rect width="{W}" height="{h}" fill="url(#wallG)"/>'
    # big LED screen with a heart and stars
    s += f'<rect x="430" y="40" width="740" height="320" rx="20" fill="#120B2A" stroke="#6E58B0" stroke-width="8"/>'
    s += f'<rect x="450" y="60" width="700" height="280" rx="12" fill="#2A1A5E"/>'
    for gx in range(450, 1150, 20):
        s += f'<line x1="{gx}" y1="60" x2="{gx}" y2="340" stroke="#3A2A72" stroke-width="2"/>'
    s += f'<circle cx="800" cy="200" r="150" fill="#FF5D8F" opacity=".25"/>'
    s += heart(800, 205, 70, '#FF6FA4', '#FFD1E3', 6)
    for (x, y, r, c) in [(560, 110, 26, '#FFD45C'), (1050, 120, 22, '#7FE3FF'), (610, 290, 18, '#B9F27C'), (1000, 285, 24, '#C7A6FF'), (700, 90, 14, '#FFFFFF'), (930, 300, 14, '#FFFFFF')]:
        s += star(x, y, r, c, '#FFFFFF', 2)
    # curtains on both sides
    for side in (0, 1):
        x0 = 0 if side == 0 else 1600 - 360
        s += f'<rect x="{x0}" y="0" width="360" height="{h+40}" fill="#C2185B"/>'
        for k in range(8):
            x = x0 + k * 45
            s += f'<path d="M{x} 0 q22 {h/2} 0 {h+40}" fill="none" stroke="#8E0E45" stroke-width="10" opacity=".55"/><path d="M{x+20} 0 q22 {h/2} 0 {h+40}" fill="none" stroke="#E04A86" stroke-width="6" opacity=".5"/>'
        tie_x = x0 + (300 if side == 0 else 60)
        s += f'<ellipse cx="{tie_x}" cy="{h-130}" rx="26" ry="14" fill="#FFD45C" stroke="{INK}" stroke-width="3"/>'
    # valance across the top
    s += f'<rect x="0" y="0" width="{W}" height="46" fill="#A5124E"/>'
    for k in range(0, W, 80):
        s += f'<path d="M{k} 46 q40 40 80 0" fill="#C2185B" stroke="#8E0E45" stroke-width="3"/>'
    s += ''.join(f'<circle cx="{k+40}" cy="72" r="6" fill="#FFD45C"/>' for k in range(0, W, 80))
    # truss with spotlights and beams
    s += f'<rect x="300" y="8" width="1000" height="22" fill="#9C9AB0" stroke="{INK}" stroke-width="3"/>'
    for k in range(0, 1000, 40):
        s += f'<path d="M{300+k} 8 l20 22 l20 -22" fill="none" stroke="{INK}" stroke-width="2"/>'
    for (x, tx, c) in [(380, 560, '#FFF6C8'), (620, 720, '#FFC8E2'), (980, 880, '#C8F0FF'), (1220, 1040, '#FFF6C8')]:
        s += f'<polygon points="{x-14},40 {x+14},40 {tx+120},{h+120} {tx-120},{h+120}" fill="url(#beam)" opacity=".55"/>'
        s += f'<rect x="{x-22}" y="26" width="44" height="34" rx="8" fill="#2F2A3D" stroke="{INK}" stroke-width="3"/><circle cx="{x}" cy="56" r="12" fill="{c}"/>'
    # tall speakers by the screen
    s += speaker(395, h - 10, 1.2) + speaker(1205, h - 10, 1.2)
    # the stage floor: shiny dark wood, glowing front edge lights
    s += floor_boards(h, '#5B3B8E', '#3C2468', '#2A1850')
    s += f'<ellipse cx="800" cy="{h+110}" rx="380" ry="80" fill="#FFF6C8" opacity=".18"/>'
    s += f'<ellipse cx="560" cy="{h+150}" rx="120" ry="34" fill="#FFF6C8" opacity=".14"/><ellipse cx="1040" cy="{h+150}" rx="120" ry="34" fill="#C8F0FF" opacity=".14"/>'
    s += f'<rect x="0" y="{H-26}" width="{W}" height="26" fill="#1C1038"/>'
    for k in range(0, W, 40):
        c = ['#FFD45C', '#FF8FB8', '#7FE3FF', '#C7A6FF'][(k // 40) % 4]
        s += f'<circle cx="{k+20}" cy="{H-13}" r="14" fill="{c}" opacity=".35"/><circle cx="{k+20}" cy="{H-13}" r="6" fill="{c}"/>'
    # confetti in the air
    import random
    rnd = random.Random(7)
    for _ in range(70):
        x, y = rnd.uniform(380, 1220), rnd.uniform(60, 420)
        c = rnd.choice(['#FFD45C', '#FF8FB8', '#7FE3FF', '#B9F27C', '#FFFFFF'])
        s += f'<rect x="{x:.0f}" y="{y:.0f}" width="10" height="5" rx="2" fill="{c}" transform="rotate({rnd.uniform(0,180):.0f} {x:.0f} {y:.0f})" opacity=".9"/>'
    return wrap(s, d)

for name, fn in [('kpop-booth', booth), ('kpop-dressing', dressing), ('kpop-stage', stage)]:
    open(f'{name}.svg', 'w').write(fn())
print('ok')
