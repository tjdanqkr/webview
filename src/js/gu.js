/*global kakao*/
//행정구역 구분


$.getJSON("./json/se.geojson", function(geojson) {
 
    var data = geojson.features;
    var coordinates = [];    //좌표 저장할 배열
    var name = '';            //행정 구 이름
 
    $.each(data, function(index, val) {
 
        coordinates = val.geometry.coordinates;
        name = val.properties.SIG_KOR_NM;
        
        displayArea(coordinates, name);
 
    })
})
 
 
var polygons=[];                //function 안 쪽에 지역변수로 넣으니깐 폴리곤 하나 생성할 때마다 배열이 비어서 클릭했을 때 전체를 못 없애줌.  그래서 전역변수로 만듦.
    
//행정구역 폴리곤
function displayArea(coordinates, name) {
 
    var path = [];            //폴리곤 그려줄 path
    var points = [];        //중심좌표 구하기 위한 지역구 좌표들
    
    $.each(coordinates[0], function(index, coordinate) {        //console.log(coordinates)를 확인해보면 보면 [0]번째에 배열이 주로 저장이 됨.  그래서 [0]번째 배열에서 꺼내줌.
        var point = new Object(); 
        point.x = coordinate[1];
        point.y = coordinate[0];
        points.push(point);
        path.push(new kakao.maps.LatLng(coordinate[1], coordinate[0]));            //new daum.maps.LatLng가 없으면 인식을 못해서 path 배열에 추가
    })
    
    // 다각형을 생성합니다 
    var polygon = new kakao.maps.Polygon({
        map : map, // 다각형을 표시할 지도 객체
        path : path,
        strokeWeight : 2,
        strokeColor : '#004c80',
        strokeOpacity : 0.8,
        fillColor : '#fff',
        fillOpacity : 0.7
    });
    
    polygons.push(polygon);            //폴리곤 제거하기 위한 배열
 
    // 다각형에 mouseover 이벤트를 등록하고 이벤트가 발생하면 폴리곤의 채움색을 변경합니다 
    // 지역명을 표시하는 커스텀오버레이를 지도위에 표시합니다
    kakao.maps.event.addListener(polygon, 'mouseover', function(mouseEvent) {
        polygon.setOptions({
            fillColor : '#09f'
        });
 
        customOverlay.setContent('<div class="area">' + name + '</div>');
 
        customOverlay.setPosition(mouseEvent.latLng);
        customOverlay.setMap(map);
    });
 
    // 다각형에 mousemove 이벤트를 등록하고 이벤트가 발생하면 커스텀 오버레이의 위치를 변경합니다 
    kakao.maps.event.addListener(polygon, 'mousemove', function(mouseEvent) {
 
        customOverlay.setPosition(mouseEvent.latLng);
    });
 
    // 다각형에 mouseout 이벤트를 등록하고 이벤트가 발생하면 폴리곤의 채움색을 원래색으로 변경합니다
    // 커스텀 오버레이를 지도에서 제거합니다 
    kakao.maps.event.addListener(polygon, 'mouseout', function() {
        polygon.setOptions({
            fillColor : '#fff'
        });
        customOverlay.setMap(null);
    });
 
    // 다각형에 click 이벤트를 등록하고 이벤트가 발생하면 해당 지역 확대을 확대합니다.
    kakao.maps.event.addListener(polygon, 'click', function() {
        
        // 현재 지도 레벨에서 2레벨 확대한 레벨
        var level = map.getLevel()-2;
        
        // 지도를 클릭된 폴리곤의 중앙 위치를 기준으로 확대합니다
        map.setLevel(level, {anchor: centroid(points), animate: {
            duration: 350            //확대 애니메이션 시간
        }});            
 
        deletePolygon(polygons);                    //폴리곤 제거      
    });
}
function centroid (points) {
    var i, j, len, p1, p2, f, area, x, y;
 
    area = x = y = 0;
 
    for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];
 
            f = p1.y * p2.x - p2.y * p1.x;
            x += (p1.x + p2.x) * f;
            y += (p1.y + p2.y) * f;
            area += f * 3;
    }
    return new kakao.maps.LatLng(x / area, y / area);
}
function deletePolygon(polygons) {
    for (var i = 0; i < polygons.length; i++) {
        polygons[i].setMap(null);
    }
    polygons = [];
}
