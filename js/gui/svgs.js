SVGs = new class SVGs {

  constructor() {
    this.stroke_w = 0.5
    this.rect_w = 12
    this.r_bound = this.rect_w + 2 * this.stroke_w
    this.btn_str = this.create_btn_str()
  }

  p(x,y){
    return x+" "+y+" ";
  }

  rectangle(x, y, w, r1){
    var r2 = r1
    var r3 = r1
    var r4 = r1
    var h = w
    var strPath = "M"+this.p(x+r1,y); //A
    strPath+="L"+this.p(x+w-r2,y)+"Q"+this.p(x+w,y)+this.p(x+w,y+r2); //B
    strPath+="L"+this.p(x+w,y+h-r3)+"Q"+this.p(x+w,y+h)+this.p(x+w-r3,y+h); //C
    strPath+="L"+this.p(x+r4,y+h)+"Q"+this.p(x,y+h)+this.p(x,y+h-r4); //D
    strPath+="L"+this.p(x,y+r1)+"Q"+this.p(x,y)+this.p(x+r1,y); //A
    strPath+="Z";

    return strPath;
  }

  create_btn_str(){
    return this.rectangle(this.stroke_w,this.stroke_w,this.rect_w,2)
  }
}





play_btn_str = "m 205.846,158.266 -86.557,49.971 c -1.32,0.765 -2.799,1.144 " +
"-4.272,1.144 -1.473,0 -2.949,-0.379 -4.274,-1.144 -2.64,-1.525 " +
"-4.269,-4.347 -4.269,-7.402 V 100.89 c 0,-3.053 1.631,-5.88 " +
"4.269,-7.402 2.648,-1.528 5.906,-1.528 8.551,0 l 86.557,49.974 " +
"c 2.645,1.53 4.274,4.352 4.269,7.402 0,3.052 -1.626,5.877 -4.274,7.402 z"

back_btn_str = "m 217.343,203.764 c 0,3.704 -1.979,7.132 -5.187,8.982 -1.605,0.926 " +
"-3.4,1.393 -5.187,1.393 -1.792,0 -3.582,-0.467 -5.187,-1.393 l -81.103," +
"-46.823 c -0.993,-0.573 -1.854,-1.312 -2.594,-2.153 v 35.955 c 0,9.498 " +
"-7.7,17.198 -17.198,17.198 -9.498,0 -17.198,-7.7 -17.198,-17.198 v " +
"-89.078 h 0.002 c 0,-9.498 7.7,-17.198 17.198,-17.198 9.498,0 17.198,7.7 " +
"17.198,17.198 v 39.465 c 0.739,-0.84 1.6,-1.58 2.594,-2.155 l 81.1," +
"-46.823 c 3.211,-1.854 7.164,-1.854 10.375,0 3.208,1.852 5.187,5.278 " +
"5.187,8.984 v 93.646 z"

stop_btn_str = "m 196.63,210.605 h -93.26 c -7.706,0 -13.974,-6.269 -13.974,-13.974 " +
"v -93.259 c 0,-7.706 6.269,-13.974 13.974,-13.974 h 93.259 c 7.706," +
"0 13.974,6.269 13.974,13.974 v 93.259 h 0.001 c 0,7.706 -6.268,13.974 -13.974,13.974 z"

pause_btn_str = "m 134.41,194.538 c 0,9.498 -7.7,17.198 -17.198,17.198 -9.498,0 " +
"-17.198,-7.7 -17.198,-17.198 V 105.46 c 0,-9.498 7.7,-17.198 " +
"17.198,-17.198 9.498,0 17.198,7.7 17.198,17.198 z m 64.545,0 c " +
"0,9.498 -7.701,17.198 -17.198,17.198 -9.498,0 -17.198,-7.7 " +
"-17.198,-17.198 V 105.46 c 0,-9.498 7.7,-17.198 17.198,-17.198" +
" 9.498,0 17.198,7.7 17.198,17.198 z"

loop_btn_str = "m 230.091,172.444 c -9.921,37.083 -43.801,64.477 -83.969,64.477 " +
"-47.93,0 -86.923,-38.99 -86.923,-86.923 0,-47.933 38.99,-86.92 " +
"86.923,-86.92 21.906,0 41.931,8.157 57.228,21.579 l -13.637,23.623 " +
"c -11,-11.487 -26.468,-18.664 -43.594,-18.664 -33.294,0 -60.38,27.088 " +
"-60.38,60.38 0,33.294 27.085,60.38 60.38,60.38 25.363,0 47.113," +
"-15.728 56.038,-37.937 h -20.765 l 36.168,-62.636 36.166,62.641 h -23.635 z"

bounds_btn_str = "m 70.75,90.24023 c -1.4415,0 -2.882328,0.37269 -4.173828,1.11719 " +
"-2.584,1.488 -4.169922,4.25152 -4.169922,7.22852 0,55.34029 0.31608," +
"53.40689 0,102.60351 0,2.98 1.588875,5.73757 4.171875,7.22657 " +
"1.292,0.744 2.731875,1.12304 4.171875,1.12304 1.44,0 2.880922," +
"-0.37904 4.169922,-1.12304 l 59.533198,-51.30079 c 2.583,-1.488 " +
"4.17488,-4.24851 4.17188,-7.22851 0.01,-2.978 -1.58497,-5.74056 " +
"-4.16797,-7.22656 L 74.925781,91.35742 C 73.634281,90.61292 72.1915," +
"90.24023 70.75,90.24023 Z m 160.26758,0.11329 c -1.44,0 -2.88288," +
"0.37904 -4.17188,1.12304 l -59.53125,51.30078 c -2.583,1.488 " +
"-4.17682,4.24852 -4.17383,7.22852 -0.01,2.978 1.58497,5.73861 " +
"4.16797,7.22461 l 59.53321,51.30469 c 2.583,1.489 5.76465,1.489 " +
"8.34765,0 2.584,-1.488 4.17188,-4.25152 4.17188,-7.22852 0,-55.34029 " +
"-0.31608,-53.40689 0,-102.60352 0,-2.98 -1.59083,-5.73756 " +
"-4.17383,-7.22656 -1.292,-0.744 -2.72992,-1.12304 -4.16992,-1.12304 z"

loop_bound_left = "M 0,20 V 0 L 12,9.302 V 0 h 3 v 10 10 h -3 v -9.301 z"

loop_bound_right = "M 15,0 15,20 3,10.698 3,20 0,20 0,10 V 0 l 3,0 v 9.301 z"

eject_btn_str = "M 149.48242 82.082031 C 145.87942 82.082031 142.44423 83.471063 " +
"139.99023 85.914062 L 79.53125 146.13867 C 79.38025 146.28667 " +
"79.238703 146.43684 79.095703 146.58984 C 78.156703 147.62484 " +
"77.433734 148.76403 76.927734 149.95703 C 76.426734 151.14503 " +
"76.120781 152.41505 76.050781 153.74805 C 76.039781 153.95105 " +
"76.035156 154.14956 76.035156 154.35156 L 76.035156 154.50391 " +
"C 76.059156 156.15091 76.437375 157.72444 77.109375 159.14844 " +
"C 77.781375 160.58244 78.763734 161.91178 80.052734 163.05078 " +
"L 80.0625 163.06055 C 80.2465 163.22355 80.436906 163.37825 " +
"80.628906 163.53125 C 80.633906 163.53125 80.633672 163.53711 " +
"80.638672 163.53711 C 81.774672 164.42911 83.034422 165.10612 " +
"84.357422 165.57812 C 85.605422 166.02412 86.947703 166.29328 " +
"88.345703 166.36328 L 88.359375 166.36328 C 88.583375 166.36828 " +
"88.728062 166.36805 89.039062 166.37305 L 209.92188 166.37305 " +
"L 209.95703 166.37305 L 210.00586 166.37305 C 217.16686 166.37305 " +
"222.97461 160.99247 222.97461 154.35547 C 222.97461 150.85647 " +
"221.36683 147.71072 218.79883 145.51172 L 158.97656 85.914062 " +
"C 156.52256 83.469063 153.08542 82.082031 149.48242 82.082031 " +
"z M 90.736328 184.95898 C 82.618328 184.95898 76.037109 " +
"191.53916 76.037109 199.66016 C 76.037109 207.77616 82.618328 " +
"214.35547 90.736328 214.35547 L 208.27539 214.35547 C 216.39339 " +
"214.35547 222.97466 207.77316 222.97266 199.66016 C 222.97266 " +
"191.53916 216.39144 184.95898 208.27344 184.95898 L 90.736328 " +
"184.95898 z"

scroll_btn_str = "m 84.09375,90.23633 c -1.296003,0 -2.593806,0.34016 -3.753906,1.00976 l -42.7792" +
"97,52.17188 c -2.3247,1.3392 -3.758559,3.82386 -3.755859,6.50586 -0.009,2.6802 1" +
".4253,5.16455 3.75,6.50195 l 42.779296,52.17383 c 2.3247,1.3401 5.188976,1.3401 " +
"7.513676,0 2.3256,-1.3392 3.75394,-3.82656 3.7539,-6.50586 v -29.87403 h 25.7539" +
"1 V 127.58301 H 92.27539 L 91.60156,97.75 c 4e-5,-2.682 -1.4292,-5.16381 -3.7539" +
",-6.50391 -1.1628,-0.6696 -2.45791,-1.00976 -3.75391,-1.00976 z m 125.76953,0.08" +
"2 c -1.29735,0 -2.59546,0.33581 -3.75781,1.00586 -2.3256,1.3392 -3.56117,3.82498" +
" -3.60547,6.5039 l -0.22461,29.75489 h -25.20117 v 44.63671 h 25.26172 l 0.0156," +
"29.95411 c 0.0463,2.6816 1.43116,5.16185 3.75586,6.50195 1.1628,0.6696 2.45791,1" +
".01172 3.75391,1.01172 1.296,0 2.5938,-0.34212 3.7539,-1.01172 l 42.7793,-52.169" +
"92 c 2.3247,-1.3392 3.75886,-3.82386 3.75586,-6.50586 0.009,-2.6802 -1.42725,-5." +
"16651 -3.75195,-6.50391 l -42.7793,-52.17187 c -1.16235,-0.67005 -5.05321,-1.005" +
"86 -3.75586,-1.00586 z m -74.51562,37.26465 v 44.63671 h 23.52343 v -44.63671 z"

btn_str = "M 0 0 L 0 15 L 15 15 L 15 0 L 0 0 z M 14.394531 0.67382812 " +
"L 14.40625 14.369141 L 0.74804688 14.345703 L 0.69726562" +
" 0.68359375 L 14.394531 0.67382812 z M 1.7441406 1.765625 " +
" L 1.7304688 13.478516 L 13.388672 13.490234 L 13.373047 " +
" 1.7832031 L 1.7441406 1.765625 z "