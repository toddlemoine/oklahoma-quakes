all: us.json

clean:
	rm -rf -- us.json build

.PHONY: all clean

build/gz_2010_us_050_00_20m.shp: build/gz_2010_us_050_00_20m.zip
	unzip -od $(dir $@) $<
	touch $@

build/gz_2010_us_050_00_20m.zip:
	mkdir -p $(dir $@)
	curl -o $@ http://www2.census.gov/geo/tiger/GENZ2010/gz_2010_us_050_00_20m.zip

build/counties.csv: build/gz_2010_us_050_00_20m.dbf
	python ~/bin/dbf2csv/dbf2csv.py $< $@ 
	

build/counties.json: build/gz_2010_us_050_00_20m.shp
	node_modules/.bin/topojson \
		-o $@ \
		--id-property='STATE+COUNTY,Id2' \
		--projection='width = 960, height = 600, d3.geo.albersUsa() \
			.scale(1280) \
			.translate([width / 2, height / 2])' \
		--simplify=.5 \
		--filter=none \
		-- counties=$<

build/ok_counties.json: build/gz_2010_us_050_00_20m.shp
	ogr2ogr \
		-f GeoJSON \
		-where "STATE IN ('40')" \
		$@ \
		$<

	node_modules/.bin/topojson \
		-o build/ok_counties.topo.json \
		--id-property GEO_ID \
		--properties name=NAME \
		--projection='width = 960, height = 600, d3.geo.albersUsa() \
			.scale(1280) \
			.translate([width / 2, height / 2])' \
		--simplify=.5 \		
		--filter=none
		-- $@

build/states.json: build/counties.json
	node_modules/.bin/topojson-merge \
		-o $@ \
		--in-object=counties \
		--out-object=states \
		--key='d.id.substring(0, 2)' \
		-- $<

us.json: build/states.json
	node_modules/.bin/topojson-merge \
		-o $@ \
		--in-object=states \
		--out-object=nation \
		-- $<

# build/oklahoma_counties_topo.json: build/oklahoma_counties.json
#     node_modules/.bin/topojson \
#         -o $@ \
#         --projection 'd3.geo.albersUsa()' \
#         --width 960 \
#         --height 800 \
#         --margin 20 \
#         --simplify=.5 \
#         --filter=none \
#         -- counties=$<

# build/quakes_topo.json: build/quakes.json
#     node_modules/.bin/topojson \
#         -o $@ \
#         --projection 'd3.geo.albersUsa()' \
#         --width 960 \
#         --height 800 \
#         --margin 20 \
#         --simplify=.5 \
#         --filter=none \
#         -- counties=$<


#     node_modules/.bin/topojson \
#         -o build/oklahoma_counties_nop.json \
#         --simplify=.5 \
#         --filter=none \
#         -- counties=build/counties.json 
#         # -- quakes=build/quakes.json
