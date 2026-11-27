#!/bin/sh
# Russland mit seinen Föderationssubjekten (Oblaste, Republiken, Krai …) für die Karte -> daten/russland.geojson
# Quelle: Natural Earth 1:10m Admin-1 (gemeinfrei). Krim und Sewastopol gehören zur Ukraine und bleiben außen vor.
set -e
curl -sSfL https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson -o /tmp/admin1.geojson
npx -y mapshaper@0.6.102 /tmp/admin1.geojson \
  -filter "adm0_a3 == 'RUS' && ['Crimea', 'Sevastopol'].indexOf(name) < 0" \
  -filter-fields name,name_de \
  -simplify 6% keep-shapes \
  -o daten/russland.geojson precision=0.001 format=geojson
ls -l daten/russland.geojson
