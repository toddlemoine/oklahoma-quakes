# build/gz_2010_us_050_00_500k.shp: build/gz_2010_us_050_00_500k.zip
#   unzip -od $(dir $@) $<
#   touch $@

build/oklahoma_counties_topo.json: build/oklahoma_counties.json
    node_modules/.bin/topojson \
        -o $@ \
        --projection 'd3.geo.albersUsa()' \
        --width 960 \
        --height 800 \
        --margin 20 \
        --simplify=.5 \
        --filter=none \
        -- counties=$<

build/quakes_topo.json: build/quakes.json
    node_modules/.bin/topojson \
        -o $@ \
        --projection 'd3.geo.albersUsa()' \
        --width 960 \
        --height 800 \
        --margin 20 \
        --simplify=.5 \
        --filter=none \
        -- counties=$<


    node_modules/.bin/topojson \
        -o build/quakes_topo.json \
        --projection 'd3.geo.albersUsa()' \
        --width 960 \
        --height 800 \
        --margin 20 \
        --simplify=.5 \
        --filter=none \
        -- counties=build/counties.json quakes=build/quakes.json

