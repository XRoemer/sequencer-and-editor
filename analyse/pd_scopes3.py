# -*- encoding: utf-8 -*-

#  ***** GPL LICENSE BLOCK *****
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.
#  All rights reserved.
#
#  ***** GPL LICENSE BLOCK *****


import sys
#sys.dont_write_bytecode = True

from PyQt4 import QtGui, QtCore

import pyext

from vispy import app, gloo
from vispy.gloo import gl 
from vispy import visuals
from vispy.visuals.transforms import STTransform, NullTransform
from vispy.gloo import Program, VertexBuffer, IndexBuffer
from vispy.util.transforms import perspective, translate, rotate

from functools import partial
from math import exp as math_exp
from traceback import format_exc as tb
from threading import Thread 
import numpy as np
import re
from collections import OrderedDict
from math import e as euler
from copy import deepcopy
import inspect


# try:
#     from OpenGL import GL
# except Exception as e:
#     print(e)


platform = sys.platform
import platform as platf

def pydevBrk():      
    # adjust your path 
    platf1 = platf.platform()
    
    if platform == 'linux':
        # Ubuntu
        sys.path.append('/home/xgr/.eclipse/org.eclipse.platform_4.4.1_1473617060_linux_gtk_x86_64/plugins/org.python.pydev_4.0.0.201504132356/pysrc') 
        # Fedora
        #sys.path.append('/root/.p2/pool/plugins/org.python.pydev_4.4.0.201510052309/pysrc')     
    else:
        if 'Windows-10' in platf1:
            sys.path.append(r'C:/Users/xgr/.p2/pool/plugins/org.python.pydev_4.5.4.201601292234/pysrc') 
        else:
            sys.path.append(r'C:/Users/Homer/.p2/pool/plugins/org.python.pydev_4.4.0.201510052309/pysrc')
        # win10
        
    from pydevd import settrace
    settrace('localhost', port=5678, stdoutToServer=True, stderrToServer=True) 
         
pd = pydevBrk


win_geometry = QtCore.QRect(200, 200, 840, 580)
       
class Main_Window(QtGui.QMainWindow):
    def __init__(self, caller, open_graph_on_top):
        super(Main_Window, self).__init__()
        
        self.caller = caller

        if open_graph_on_top:
            QtGui.QMainWindow.__init__(self, None, QtCore.Qt.WindowStaysOnTopHint)
        else:
            QtGui.QMainWindow.__init__(self, None)

        self.setGeometry(win_geometry)  
        self.update()
    
    def closeEvent(self,event):
        self.caller.started = False
        global win_geometry
        win_geometry = self.geometry()
        

 
class Scopes(pyext._class):
    
    def __init__(self,*args):
        print('init:', args)
                 
        self.amount_scopes = 1
        self.scopes_info = {0: {'type':'scope'} }
        self.scopes = {}
        
        self.buffer_size = self._blocksize()
        self.update_display = 30
        self.smpls_all = 220500        
        
        
        self.open_graph_on_top = 1
        self.started = False
        
        self.scope_color_fg = (1, .5, 0)
        self.scope_color_bg = (0, 0, 0)
        self.spectro_color_fg = (1, .5, 0)
        self.spectro_color_bg = (0, 0, 0)
        self.use_spectro = False
        self.power_spectrum = 0
        
        self.is_running = False
        
        self.replay = True
        self.replay_scope = None
        self.replay_pos = 0
           
        
    
    def _anything_(self,n,*args):
        #print("Message into inlet",n,":",args)
        
        str_arg = str(args[0])
        
        # defaults
        spectro_freq_cut = 5000
        spectro_win_size = 1024
        
        def get_color(a,t):
            i = t.index(a)
            r = float(t[i + 1])
            g = float(t[i + 2])
            b = float(t[i + 3])
            return r,g,b

        try:
            
            if str_arg.startswith('start'):
                self.is_running = True
            if str_arg.startswith('stop'):
                self.is_running = False
                
            if str_arg.startswith('mul'):
                c = pyext.Buffer(args[1])
                ab = c[:]
                c.dirty()
                lenc = len(c)
                
                
                #print(np.sum(ab))
                del ab
                return
                
                
            if str_arg.startswith('open_scopes'):
                
                if self.started:
                    return
                else:
                    self.started = True
                
#                 t = Thread(target=self.start_v,args=())
#                 t.start()

                
                self.start_v()
                
            else:
                txt = ' '.join([str(a) for a in args])
                txt_split = re.split(r'\s(?=(?:scope|spectro)\b)', txt)
                
                                
                # COLORS
                txt_split2 = txt.split()
                            
                if '-color' in txt:
                    try:
                        r,g,b = get_color('-color', txt_split2)
                        self.scope_color_fg = r,g,b
                        self.spectro_color_fg = r,g,b
                    except:
                        pass
                    
                if '-bg-color' in txt:
                    txt_split2 = txt.split()
                    try:
                        r,g,b = get_color('-bg-color', txt_split2)
                        self.scope_color_bg = r,g,b
                        self.spectro_color_bg = r,g,b
                    except:
                        pass
                    
                if '-scope-color' in txt:
                    txt_split2 = txt.split()
                    try:
                        r,g,b = get_color('-scope-color', txt_split2)
                        self.scope_color_fg = r,g,b
                    except:
                        pass
                    
                if '-scope-bg-color' in txt:
                    txt_split2 = txt.split()
                    try:
                        r,g,b = get_color('-scope-bg-color', txt_split2)
                        self.scope_color_bg = r,g,b
                    except:
                        pass
                    
                if '-spectro-color' in txt:
                    txt_split2 = txt.split()
                    try:
                        r,g,b = get_color('-spectro-color', txt_split2)
                        self.scope_color_fg = r,g,b
                    except:
                        pass
                    
                if '-spectro-bg-color' in txt:
                    txt_split2 = txt.split()
                    try:
                        r,g,b = get_color('-spectro-bg-color', txt_split2)
                        self.scope_color_bg = r,g,b
                    except:
                        pass
                    
                               
                # ON_TOP
                if '-on_top' in txt:
                    self.open_graph_on_top = True
                elif '-not_on_top' in txt:
                    self.open_graph_on_top = False
                    
                    
                # AMOUNT OF DISPLAYED SAMPLES 
                txt_split1 = txt_split[0].split(' ')
                for t in txt_split1:
                    if t.isdigit():
                        self.smpls_all = int(t)
                
                
                # RETURN IF NO SCOPES OR spectroGRAMS ARE USED
                if ('-scope' in txt) or ('-spectro' in txt) or ('color' in txt):
                    return  
                
                
                # SET AMOUNT AND ORDER OF SCOPES AND spectroGRAMS
                self.scopes_info = OrderedDict()
                
                for i in range(1, len(txt_split)):
                    
                    j = i - 1
                    
                    if txt_split[i] == 'scope':
                        self.scopes_info[j] = {'type' : 'scope'}
                                         
                    elif txt_split[i].startswith('spectro'):
                        
                        self.scopes_info[j] = {'type' : 'spectro'} 
                        self.use_spectro = True
                        
                        txt_split2 = txt_split[i].split()
                        
                        if '-win' in txt_split2:
                            try:
                                index = txt_split2.index('-win')
                                if txt_split2[index + 1].isdigit():
                                    self.scopes_info[j]['win'] = int(txt_split2[index + 1])
                            except:
                                self.scopes_info[j]['win'] = spectro_win_size
                                
                        if '-cut' in txt_split2:
                            try:
                                index = txt_split2.index('-cut')
                                if txt_split2[index + 1].isdigit():
                                    self.scopes_info[j]['cut'] = int(txt_split2[index + 1])
                            except:
                                self.scopes_info[j]['cut'] = spectro_freq_cut
                            
                        
                self.amount_scopes = len(self.scopes_info)
                   
        except:
            print(tb())

    
    def start_v(self):
        
        try:  
            oApp = app.use_app()
            oApp.native.aboutToQuit.connect(oApp.native.deleteLater)
            
            self.win = Main_Window(self, self.open_graph_on_top)

            self.gui()
            self.win.setCentralWidget(self.top_widget)
            self.win.show()
            
            oApp.run()
               
        except Exception as e:
            print(tb())
    
    
    def open_spectro(self):       
        
        try:
            self.gui_spectrogram()
            self.win2 = Main_Window(self, self.open_graph_on_top)
            self.win2.setCentralWidget(self.top_widget2)
            self.win2.show()
        
        except Exception as e:
            print(tb())
                         
    def adjust_y(self, scope=None):
        
        try:
            
            # adjust_y called from button
            if scope == False:
                scope = None
            
            def adjust(scope):
    
                if scope.is_scope:
                    data = scope.y[0]
                    maxi = max(0, np.amax(data))
                    mini = min(0, np.amin(data))
                else:
                    maxi = float(scope.fft_window_size_spectro)
                    mini = 0
                
                positions, null_pos = berechne_abstaende_y_Achse(maxi, mini)
    
                
                if maxi - mini == 0:
                    adjust = 1
                else:
                    adjust = 2 / (maxi - mini)
                
                scope.program['adjust_y'] = adjust
                scope.program['drag_y'] = null_pos
                scope.drag_y = null_pos
                scope.program['zoom_y'] = 1
                scope.zoom_y = 1
                
                if scope.is_scope:
                    # Update der 0-Linie
                    model = translate((0, null_pos, 0))
                    scope.xAchse['model'] = model
                else:
                    positions, null_pos = berechne_abstaende_y_Achse2(scope.fft_window_size, 0, 1, scope.cut_freq )
                    
                # Update der Skalierungsanzeige
                scope.yAxis.max_y = maxi 
                scope.yAxis.min_y = mini
                
                scope.yAxis.drag_y = 0
                scope.yAxis.zoom_y = 1
                scope.yAxis.positions = positions  
                scope.yAxis.update()
                
                scope.update()
            
                
                
            if scope==None:
                for a in range(self.amount_scopes):
                    adjust(self.scopes[a])
            else:
                adjust(scope)
                
        except Exception as e:
            print(tb())
            
            

    def set_markers_to_selected(self,*ev):
        
        nr = ev[0][0]
        scope = self.scopes[nr]
        pos = scope.pos_markline
        
        for a in range(self.amount_scopes):
            if a != nr:
                scope = self.scopes[a]
                scope.pos_markline = pos
                scope.setze_markierungslinie()

    
    def set_xrange_to_selected(self,*ev):
        
        nr = ev[0][0]
        scope = self.scopes[nr]
        versatz = scope.program['versatz'][0]
        drag_x = scope.program['drag_x'][0]
        zoom_x = scope.program['zoom_x'][0]
        sichtbare = scope.sichtbare
        positions = scope.xAxis.positions
        pos = scope.pos_markline
        
        for a in range(self.amount_scopes):
            if a != nr:
                scope = self.scopes[a]
                scope.program['versatz'] = float(versatz)
                scope.program['drag_x'] = float(drag_x)
                scope.program['zoom_x'] = float(zoom_x)
                scope.drag_x = float(drag_x)
                scope.sichtbare = sichtbare
                
                scope.setze_markierungslinie()
                
                scope.xAxis.positions = positions  
                scope.xAxis.update()

                scope.update()
                    
    def gui_spectrogram(self):
        
        try:
        ## top-level widget to hold everything
            self.top_widget2 = QtGui.QWidget()
            self.top_widget2.setStyleSheet('QWidget {color: #c9c9c9; background-color: #333333}')
    
            toplayout2 = QtGui.QGridLayout()
            self.top_widget2.setLayout(toplayout2)
            toplayout2.setSpacing(0)
            
            btn_y_zoom = QtGui.QPushButton('adjust y')
            btn_y_zoom.setStyleSheet('QPushButton {color: #c9c9c9; background-color: #474747}')
            btn_y_zoom.clicked.connect(self.adjust_y)
            

            widget_head = QtGui.QWidget()
            layout_head = QtGui.QGridLayout()
            widget_head.setLayout(layout_head)
            layout_head.setSpacing(0)
            widget_head.setMaximumHeight(60)
    
            #void QGridLayout::addWidget(  fromRow,  fromColumn,  rowSpan,  columnSpan,  alignment = 0)
            toplayout2.addWidget(widget_head, 0, 1, 1, 2)
            layout_head.addWidget(btn_y_zoom, 1, 3, 1, 1)
            
            
            nr = 0
            scope = self.gui_live_spectrogram(toplayout2, nr, self.scopes_info[nr], False)
            
            self.adjust_y(scope)
                
 
        except Exception as e:
            print(tb())   
                      
                                        
    def gui(self):
        
        try:
            ## top-level widget to hold everything
            self.top_widget = QtGui.QWidget()
            self.top_widget.setStyleSheet('QWidget {color: #c9c9c9; background-color: #333333}')
    
            toplayout = QtGui.QGridLayout()
            self.top_widget.setLayout(toplayout)
            toplayout.setSpacing(0)
            
            btn_y_zoom = QtGui.QPushButton('adjust y')
            btn_y_zoom.setStyleSheet('QPushButton {color: #c9c9c9; background-color: #474747}')
            btn_y_zoom.clicked.connect(self.adjust_y)
            
#             btn_spectro = QtGui.QPushButton('open spectro')
#             btn_spectro.setStyleSheet('QPushButton {color: #c9c9c9; background-color: #474747}')
#             btn_spectro.clicked.connect(self.open_spectro)

            
            btn_replay = QtGui.QPushButton('playback')
            btn_replay.setStyleSheet('QPushButton {color: #c9c9c9; background-color: #474747}')
            btn_replay.clicked.connect(self.playback)
            
            if self.use_spectro:
                btn_ps = QtGui.QPushButton('power spectrum')
                btn_ps.setStyleSheet('QPushButton {color: #c9c9c9; background-color: #474747}')
                btn_ps.clicked.connect(self.toggle_power_spectrum)
                
            

            widget_head = QtGui.QWidget()
            layout_head = QtGui.QGridLayout()
            widget_head.setLayout(layout_head)
            layout_head.setSpacing(0)
            widget_head.setMaximumHeight(60)
    
            #void QGridLayout::addWidget(  fromRow,  fromColumn,  rowSpan,  columnSpan,  alignment = 0)
            toplayout.addWidget(widget_head, 0, 1, 1, 2)
            layout_head.addWidget(btn_y_zoom, 1, 3, 1, 1)
            layout_head.addWidget(btn_replay, 1, 4, 1, 1)
            if self.use_spectro:
                layout_head.addWidget(btn_ps, 1, 5, 1, 1)
            
            
            for nr, info in self.scopes_info.items():
                if info['type'] == 'spectro':
                    self.scopes[nr] = self.gui_live_spectrogram(toplayout, nr, self.scopes_info[nr])
                else:
                    self.scopes[nr] = self.gui_scope(toplayout, nr)
                
                
            self.adjust_y()
            
        
        except Exception as e:
            print(tb())
            #pd()
    
    
    
    def gui_live_spectrogram(self, toplayout, a, info, live_scope=True):
        
        # http://doc.qt.io/qt-4.8/stylesheet-examples.html
        style = '''
QSlider { height: 16px; }
        
       
QSlider:handle:horizontal {
    background: grey;
    border: 1px solid blue;
    border-radius: 3px;
    
}

'''
        
        xAxis = XAxis()
        yAxis = YAxis_spectrogram(self)
        
        
        if live_scope:
            spectro = Canvas_Live_Spectrogram(self, self.smpls_all, self.buffer_size, xAxis, yAxis, info) 
            self.scopes[a] = spectro
        else:
            spectro = Canvas_Spectrogram(self, self.smpls_all, self.buffer_size, xAxis, yAxis, info) 
            self.spectro = spectro

        yAxis.spectro = spectro
        
        slider_boost = QtGui.QSlider()
        slider_boost.setInvertedControls(True)
        slider_boost.setOrientation(QtCore.Qt.Horizontal)
        slider_boost.setMaximum(200)
        slider_boost.setMinimum(1)
        slider_boost.valueChanged.connect(spectro.boost_color)    
        slider_boost.setStyleSheet("QSlider { height: 16px; }") 
        slider_boost.setTickInterval(40)
        slider_boost.setTickPosition(1) 
        slider_boost.setValue(10)
        
        spectro.slider_boost = slider_boost      
        
        slider_point_size = QtGui.QSlider()
        slider_point_size.setOrientation(QtCore.Qt.Horizontal)
        slider_point_size.setMaximum(200)
        slider_point_size.setMinimum(1)
        slider_point_size.valueChanged.connect(spectro.change_point_size)
        slider_point_size.setStyleSheet("QSlider { height: 16px; background-color:  #474747;}") 
        slider_point_size.setTickInterval(100)
        slider_point_size.setTickPosition(1)
        
        spectro.slider_point_size = slider_point_size   
        
        slider_cut = QtGui.QSlider()
        slider_cut.setOrientation(QtCore.Qt.Horizontal)
        slider_cut.setMaximum(100)
        slider_cut.setMinimum(0)
        slider_cut.valueChanged.connect(spectro.cut_displayed_values)
        slider_cut.setStyleSheet("QSlider { height: 16px; }")
        slider_cut.setTickInterval(20)
        slider_cut.setTickPosition(1)
        
        spectro.slider_cut = slider_cut   
        
        widget = QtGui.QWidget()
        layout = QtGui.QGridLayout()
        widget.setLayout(layout)
        layout.setSpacing(0)
        layout.setContentsMargins(10, 0, 20, 5)
        spectro.widget = widget
         
        toplayout.addWidget(widget, 4 + a,1,1,2)
        
        layout.addWidget(slider_boost, 0,2,1,1)
        layout.addWidget(slider_point_size, 0,3,1,1)
        layout.addWidget(slider_cut, 0,4,1,1)
        layout.addWidget(spectro.native, 2,2,1,3)
          
        btn_marker = QtGui.QPushButton('m')
        btn_marker.setStyleSheet('QPushButton {color: #c9c9c9; background-color: #474747}')
        btn_marker.clicked.connect(partial( self.set_markers_to_selected,(a, 'marker')) )
          
        btn_y_transfer = QtGui.QPushButton('tr')
        btn_y_transfer.setStyleSheet('QPushButton {color: #c9c9c9; background-color: #474747}')
        btn_y_transfer.clicked.connect(partial(self.set_xrange_to_selected, (a, 'transfer')) )
        btn_y_transfer.setObjectName("newGame")
          
        widget_scope_btns = QtGui.QWidget()
        widget_scope_btns.setFixedWidth(40)
        widget_scope_btns.setFixedHeight(25)
        
        layout_scope_btns = QtGui.QGridLayout()
        widget_scope_btns.setLayout(layout_scope_btns)
        layout_scope_btns.setSpacing(2)
        layout_scope_btns.setContentsMargins(0,5,5,0)
          
        layout_scope_btns.addWidget(btn_marker, 2, 0, 1, 1)
        layout_scope_btns.addWidget(btn_y_transfer, 2, 1, 1, 1)
        layout.addWidget(widget_scope_btns, 4,1,1,1)
                
        layout.addWidget(xAxis, 4,2,1,3)
        xAxis.setFixedHeight(25)
        
        layout.addWidget(yAxis, 2,1,1,1) 
        yAxis.setFixedWidth(50)
        
        return spectro
    
    
    def gui_scope(self, toplayout, a):
        
        xAxis = XAxis()
        yAxis = YAxis_Scope()
        scope = Canvas_Scope(self, self.smpls_all, xAxis, yAxis, self.scopes) 
        
        widget = QtGui.QWidget()
        layout = QtGui.QGridLayout()
        widget.setLayout(layout)
        layout.setSpacing(0)
        layout.setContentsMargins(10, 0, 20, 5)
        scope.widget = widget
         
        toplayout.addWidget(widget, 4 + a,1,1,2)
        layout.addWidget(scope.native, 0,2,1,1)
          
        btn_marker = QtGui.QPushButton('m')
        btn_marker.setStyleSheet('QPushButton {color: #c9c9c9; background-color: #474747}')
        btn_marker.clicked.connect(partial( self.set_markers_to_selected,(a, 'marker')) )
          
        btn_y_transfer = QtGui.QPushButton('tr')
        btn_y_transfer.setStyleSheet('QPushButton {color: #c9c9c9; background-color: #474747}')
        btn_y_transfer.clicked.connect(partial(self.set_xrange_to_selected, (a, 'transfer')) )
        btn_y_transfer.setObjectName("newGame")
          
        widget_scope_btns = QtGui.QWidget()
        widget_scope_btns.setFixedWidth(40)
        widget_scope_btns.setFixedHeight(25)
        
        layout_scope_btns = QtGui.QGridLayout()
        widget_scope_btns.setLayout(layout_scope_btns)
        layout_scope_btns.setSpacing(2)
        layout_scope_btns.setContentsMargins(0,5,5,0)
          
        layout_scope_btns.addWidget(btn_marker, 0, 0, 1, 1)
        layout_scope_btns.addWidget(btn_y_transfer, 0, 1, 1, 1)
        layout.addWidget(widget_scope_btns, 2,1,1,1)
        
        layout.addWidget(xAxis, 2,2,1,1)
        xAxis.setFixedHeight(25)
        
        layout.addWidget(yAxis, 0,1,1,1) 
        yAxis.setFixedWidth(50)
        
        return scope
    
    
    def toggle_power_spectrum(self):
        
        self.power_spectrum = not(self.power_spectrum)
    
    def playback(self):
        
        self.replay = not self.replay
        
    
    def init_playback(self, scope, pos):
        
        if 0 <= pos < self.smpls_all:
            self.replay_scope = scope
            self.replay_pos = pos

        
    def playback_samples(self):
        
        try:
            if self.replay_pos + self.buffer_size < self.replay_scope.pos_markline and self.replay_pos + self.buffer_size < self.smpls_all:
                self._outvec(0)[:] = self.replay_scope.y[0][self.replay_pos : self.replay_pos + self.buffer_size]
                self.replay_pos += self.buffer_size
        except Exception as e:
            print(tb())
            
        
    
    
    def scope_signal(self, scope, i):
        
        try:
            
            if scope.buffer_counter + self.buffer_size >= self.smpls_all  :
                    
                noch_zu_schreibende = self.smpls_all - scope.buffer_counter - 1
  
                ysl = self._invec(i)                    
                scope.y[0][scope.buffer_counter: scope.buffer_counter + noch_zu_schreibende] = ysl[:noch_zu_schreibende]
                scope.y[0][: self.buffer_size - noch_zu_schreibende] = ysl[noch_zu_schreibende:]
                scope.program['position'].set_data(scope.y)

                scope.buffer_counter = self.buffer_size - noch_zu_schreibende - 1
                scope.counter = 0
                
            else:
                
                ysl = self._invec(i)                    
                scope.y[0][scope.buffer_counter: scope.buffer_counter + self.buffer_size] = ysl
                scope.program['position'].set_data(scope.y)
                
                scope.buffer_counter += self.buffer_size
                scope.counter += 1
                                
                # Updating the scopes every Nth time for less gpu/cpu usage
                if scope.counter % self.update_display == 0:
                    
                    scope.counter = 0

                    zoom = scope.program['zoom_x'][0]
                    versatz = scope.program['versatz'][0]
                    drag_x = scope.program['drag_x'][0]
                    
                    pos = -1 + float(scope.buffer_counter) / self.smpls_all * 2 
                    pos += drag_x 
                    pos = pos * zoom + scope.program['versatz'][0]
                    
                    scope.prg_poslinie['model'] = translate((pos, 0, 0))
                    scope.pos_line = scope.buffer_counter
                    scope.update()
                    
        
        except Exception as e:
            print(tb())
            
        
        
        
        
        
    def _signal(self):
        '''
        Drawing of the Plot Window
        '''
            
        try:
            
            if not self.started or self.replay:
                if self.replay and self.replay_scope != None:
                    self.playback_samples()
                    
                return
            
            
            
            
            for i in range(self.amount_scopes):
                
                scope = self.scopes[i]
                
                if scope.is_scope:
                    self.scope_signal(scope, i)
                    continue

                
                
                else:
                    
                    fak = 64
                    
                
                    
#                     invec = deepcopy(self._invec(i))
#                           
#                     t = Thread(target=berechne_fft,args=(invec, scope, self.buffer_size, self.smpls_all, self.update_display))
#                     t.start()
#                     continue
                
                    for k in range(64 / fak):
                         
                        vec_pos = k * fak
                        invec = self._invec(i)[vec_pos:vec_pos + fak]
                     
                        
                        scope.ysl = np.append(scope.ysl[fak :], invec )
                        fft = np.fft.rfft(scope.ysl * scope.window )
                         
                        # cut: don't show upper frequencies
                        fft = fft[:scope.fft_window_size_spectro ]
                          
                        fft_real = fft.real
                        ysl1 = np.abs(fft_real)
                        #ysl1 = fft_real * fft_real
                        
                        fft_imag = fft.imag
                        ysl2 = np.abs(fft_imag)
                        #ysl2 = fft_imag * fft_imag
               
                        #scope.ysl_fft = (np.sqrt( ysl1 + ysl2) / scope.fft_window_size * 10.).astype(np.float32)[:-1]  #/ scope.fft_window_size * 4
                        if self.power_spectrum:
                            scope.ysl_fft = (( ysl1 + ysl2)**2 / scope.fft_window_size / 50.).astype(np.float32)[:-1]
                        else:
                            scope.ysl_fft = (np.sqrt( ysl1 + ysl2) / scope.fft_window_size * 100.).astype(np.float32)[:-1]  #/ scope.fft_window_size * 4
                        
      
                        maximum = float(scope.ysl_fft.max())
                        if maximum > scope.program['maximum'][0]:
                            scope.program['maximum'] = maximum
                              
                          
                        if scope.buffer_counter + self.buffer_size >= self.smpls_all  :
                              
                            noch_zu_schreibende = self.smpls_all - scope.buffer_counter #- 1
                            scope.buffer_counter = self.buffer_size - noch_zu_schreibende
                            #scope.buffer_counter = 0 #- noch_zu_schreibende
                            scope.counter = 0
                              
                        else:
                            y_pos = int( scope.buffer_counter / self.buffer_size * scope.fft_window_size_spectro)
                              
                            scope.program['farbe'].set_subdata(scope.ysl_fft, y_pos)
                              
                            scope.buffer_counter += self.buffer_size 
                            scope.counter += 1
                                              
                            # Updating the scopes every Nth time for less gpu/cpu usage
                            if scope.counter % 50 == 0:#self.update_display  == 0:
                                scope.counter = 0
                                          
                                zoom = scope.program['zoom_x'][0]
                                versatz = scope.program['versatz'][0]
                                drag_x = scope.program['drag_x'][0]
                                  
                                pos = -1 + float(scope.buffer_counter) / self.smpls_all * 2 
                                pos += drag_x 
                                pos = pos * zoom + scope.program['versatz'][0]
                                  
                                scope.prg_poslinie['model'] = translate((pos, 0, 0))
                                scope.pos_line = scope.buffer_counter
                                  
                                scope.update()
                                
                                
                    
                    
        except Exception as e:
            pass#print(tb())
            #pd()
            


def berechne_fft(invec_pyext, scope, buffer_size, smpls_all, update_display):
    
    fak = 64
    
    for k in range(64 / fak):
                            
        vec_pos = k * fak
        invec = invec_pyext[vec_pos:vec_pos + fak]
        
        
        scope.ysl = np.append(scope.ysl[fak :], invec )
        fft = np.fft.rfft(scope.ysl * scope.window )
        
        # cut: don't show upper frequencies
        fft = fft[:scope.fft_window_size_spectro ]
        
        fft_real = fft.real#.astype(np.float32)[:-1]
        ysl1 = np.abs(fft_real)
        
        fft_imag = fft.imag#.astype(np.float32)[:-1]
        ysl2 = np.abs(fft_imag)
        
        scope.ysl_fft = (np.sqrt( ysl1 + ysl2) / scope.fft_window_size * 10.).astype(np.float32)[:-1]  #/ scope.fft_window_size * 4
        
        maximum = float(scope.ysl_fft.max())
        if maximum > scope.program['maximum'][0]:
            scope.program['maximum'] = maximum
            
        
        if scope.buffer_counter + buffer_size >= smpls_all  :
            
            #noch_zu_schreibende = self.smpls_all - scope.buffer_counter - 1
            scope.buffer_counter = 0 #- noch_zu_schreibende
            scope.counter = 0
            
        else:
            y_pos = int( scope.buffer_counter / buffer_size * scope.fft_window_size_spectro)
            
            scope.program['farbe'].set_subdata(scope.ysl_fft, y_pos)
            
            scope.buffer_counter += buffer_size 
            scope.counter += 1
                            
            # Updating the scopes every Nth time for less gpu/cpu usage
            if scope.counter % update_display  == 0:
                scope.counter = 0
        
                zoom = scope.program['zoom_x'][0]
                versatz = scope.program['versatz'][0]
                drag_x = scope.program['drag_x'][0]
                
                pos = -1 + float(scope.buffer_counter) / smpls_all * 2 
                pos += drag_x 
                pos = pos * zoom + scope.program['versatz'][0]
                
                scope.prg_poslinie['model'] = translate((pos, 0, 0))
                scope.pos_line = scope.buffer_counter
                
                scope.update()

    
    
    
    


VERT_SHADER_spectroGRAM = """

// y coordinate of the position.
attribute float farbe;
attribute vec3 color_bg;
attribute vec3 color_fg;

// time index.
attribute vec2 index;
uniform int buffer_size;

// Number of samples per signal.
uniform float all_samples;

// Zoom Position X / Y
uniform float zoom_x;
uniform float zoom_y;

attribute float versatz;
attribute float drag_x;
attribute float drag_y;
attribute float adjust_y;
attribute float boost;

attribute float point_size;
attribute float maximum;
attribute float cut_displayed_values;


varying vec4 v_color2;

void main() {
    
    float point_size =  3. * point_size;
    gl_PointSize = point_size;
    
    vec3 col;
    
    if (farbe >=  maximum * cut_displayed_values)
        { 
        float r_dif = color_fg.x - color_bg.x  ; 
        float r     = color_bg.x + r_dif * farbe * boost;
        float g_dif = color_fg.y - color_bg.y; 
        float g     = color_bg.y + (g_dif * farbe * boost);
        float b_dif = color_fg.z - color_bg.z; 
        float b     = color_bg.z + (b_dif * farbe * boost);
        
        col = vec3(r, g, b);
        }
        
    else
        {
        col = color_bg;
        }
    
    v_color2 = vec4( col, 1.);
    
    
    float x = -1 + ( index.x  / all_samples );
    float y =  index.y;   
                  
    gl_Position =  ( vec4( x * zoom_x , y * zoom_y * adjust_y , 0.0, 1.0) 
                    + vec4(drag_x * zoom_x , drag_y , 0, 0) 
                    + vec4(versatz, 0, 0, 0)
                    );
}
"""

FRAG_SHADER_spectroGRAM = """
varying vec4 v_color2;

void main() {
    gl_FragColor = v_color2;
}
"""


VERT_SHADER_SCOPE = """

// y coordinate of the position.
attribute float position;

// time index.
attribute vec3 index;

// Number of samples per signal.
uniform float all_samples;

// Zoom Position X / Y
uniform float zoom_x;
uniform float zoom_y;

attribute float versatz;
attribute float drag_x;
attribute float drag_y;
attribute float adjust_y;

attribute vec3 color;
varying vec3 u_color;

void main() {
    u_color = color;
    
    float x = -1 + ( 2 * index.z / (all_samples-1) );
    float y =  position;    
                  
    gl_Position =  ( vec4( x * zoom_x , y * zoom_y * adjust_y , 0.0, 1.0) 
                    + vec4(drag_x * zoom_x , drag_y , 0, 0) 
                    + vec4(versatz, 0, 0, 0)
                    );
}
"""

FRAG_SHADER_SCOPE = """

varying vec3 u_color;

void main() {
    gl_FragColor = vec4 (u_color, 1.0); 
}
"""



vertex_line = """

uniform mat4 model;
attribute vec3 position;

// Color.
attribute vec4 a_color;
varying vec4 v_color;

void main() {
    gl_Position =  model * vec4(position, .1);
    v_color = vec4(a_color);
}
"""

fragment_line = """
varying vec4 v_color;

void main() {
    gl_FragColor = v_color;
}
"""



class Canvas_Spectrogram(app.Canvas):
    '''
    Isn't in use yet. Can be extended to a detailed tool, which shows the fft of every sample. 
    Won't work live.
    '''
    def __init__(self, caller, smpl_all, buffer_size, xAxis, yAxis, info):
        app.Canvas.__init__(self, keys='interactive')
        
        try:
            self.caller = caller
            self.smpl_all = smpl_all
            self.buffer_size = buffer_size 
            self.xAxis= xAxis
            self.yAxis= yAxis
            
            self.buffer_counter = 0
            self.counter = 0
            self.freq = 22050
            self.fft_window_size = info['win']
            self.cut_freq = info['cut']
            
            ratio = self.cut_freq / float(self.freq)
            self.fft_window_size_spectro = ( int(self.fft_window_size * ratio) + int(self.fft_window_size * ratio) % 2 ) / 2
            print('nicht live')
            self.ysl =  np.zeros((self.fft_window_size,), dtype=np.float32) 
            self.ysl_fft = {1:None}

            self.window2 = np.hanning(self.fft_window_size)
            self.window = self.gauss_window(self.fft_window_size)
            print(len(self.ysl), len(self.ysl))     
            self.last_mouse_position = None
            
            
            self.anzeigewerte = [b * 10**a for a in reversed(range(6)) for b in (4,2,1)]
            self.sichtbare = [0, smpl_all - 1]
            self.pos_line = 0
            self.pos_markline = 0
            
            self.is_scope = False
            self.display_values = 0
            
            benutzte_smpls = self.smpl_all #/ self.buffer_size
            all_verts =  benutzte_smpls * self.fft_window_size_spectro
            farbe = np.array(np.linspace(0,0, all_verts), ndmin=2).astype(np.float32)

            my_range_1 = [a * 2 * self.buffer_size  for a in range(benutzte_smpls) ]
            index_x = np.repeat(my_range_1, self.fft_window_size_spectro )

            my_range = [ y for y in range(self.fft_window_size_spectro) ]
            index_y = np.tile( my_range, benutzte_smpls)  
            
                   
            index = np.c_[np.fromiter(index_x, np.float32).astype(np.float32),
                          np.fromiter(index_y, np.float32).astype(np.float32),
                          ].astype(np.float32)
                                                          
             
            self.program = gloo.Program(VERT_SHADER_spectroGRAM, FRAG_SHADER_spectroGRAM)
            self.program['farbe'] = farbe

            self.program['color_bg'] = self.caller.spectro_color_bg
            self.program['color_fg'] = self.caller.spectro_color_fg
            
            self.program['index'] = index
            
            self.program['all_samples'] = smpl_all
            
            self.program['versatz'] = 0
            self.program['drag_x'] = 0
            self.program['drag_y'] = 0
            
            self.program['zoom_x'] = 1.
            self.program['zoom_y'] = 1.
            
            self.program['adjust_y'] = 1.
            self.program['boost'] = 1
            
            self.program['point_size'] = 1.
            self.program['maximum'] = 0.
            self.program['cut_displayed_values'] = 0.
            
            
            self.drag_x = 0
            self.drag_y = 0
            self.zoom_y = 1
            
            self.xAchse, self.indices0 = self.create_line([-.1, 0], [.1, 0], (.3, .3, .3))
            self.prg_poslinie, self.indices = self.create_line([0, -.1], [0, .1], (0, 1., 0.))
            self.prg_marklinie, self.indices2 = self.create_line([0, -.1], [0, .1], (0, 0., 1.))
            
            self.setze_xAchse()
                         
        except Exception as e:
            print(tb())
            #pd()
             
        
    def on_mouse_press(self, event):
        self.last_mouse_position = event.pos
        
        if event.button == 3:
            pos = float(event.pos[0]) / self.physical_size[0] 
            self.setze_markierungslinie(pos)
                        
                  
    def on_mouse_move(self, event):
        
        try:
            if event.is_dragging and event.buttons == [1]:

                dx =  event.pos[0] - self.last_mouse_position[0]
                relative_dx = float(dx) / self.physical_size[0] * 2 / self.program['zoom_x'][0]
                self.drag_x += relative_dx
                self.program['drag_x'] = self.drag_x
                
                self.setze_xAchse()
                self.setze_positionslinie()  
                self.setze_markierungslinie()
                
                self.update()
                self.last_mouse_position = event.pos
                
            elif event.is_dragging and event.buttons in( [1,2], [2,1] ):
                
                dy =  (event.pos[1] - self.last_mouse_position[1] ) 
                relative_dy = -float(dy) / self.physical_size[1] * 2 / self.program['zoom_y'][0]
                self.drag_y += relative_dy * self.zoom_y 
                self.program['drag_y'] = self.drag_y

                
                relative_dy = -float(dy) / self.physical_size[1]
                self.yAxis.drag_y -= relative_dy 
                self.yAxis.set_scale_y()
                self.yAxis.update()
                
                self.update()
                self.last_mouse_position = event.pos
                
            elif event.is_dragging and event.buttons == [2]:
                
                dy = event.pos[1] - self.last_mouse_position[1]
                self.zoom_y -= dy / 50. * self.zoom_y
                self.zoom_y = max(.0000001, self.zoom_y)
                self.program['zoom_y'] = self.zoom_y
                
                self.yAxis.zoom_y = self.zoom_y
                self.yAxis.set_scale_y()
                self.yAxis.update()

                self.update()
                self.last_mouse_position = event.pos
                
            elif event.is_dragging and event.buttons == [3]:
                pos = float(event.pos[0]) / self.physical_size[0] 
                
                modifiers = list([m.name for m in event.modifiers])

                if 'Control' in modifiers:
                    for a in range(self.caller.amount_scopes):
                        scope = self.caller.scopes[a]
                        scope.pos_markline = pos
                        scope.setze_markierungslinie(pos)
                        scope.update()                            
                else:
                    self.setze_markierungslinie(pos)
                    self.update()
                    
                self.last_mouse_position = event.pos
                
        except:
            print(tb())
    
    
    def on_mouse_wheel(self, event):
        
        try:
            modifiers = list([m.name for m in event.modifiers])

            if 'Control' in modifiers and 'Shift' in modifiers:
                self.widget.setFixedHeight(self.widget.height() + event.delta[1] * 2)
            else:
                dx = np.sign(event.delta[1]) * .05
                pos_im_fenster = ( event.pos[0] / float(self.physical_size[0]) )

                self.setze_zoom_x(dx, pos_im_fenster)
                self.setze_xAchse()
                self.setze_positionslinie()   
                self.setze_markierungslinie()        
                
            self.update()             
                         
        except Exception as e:
            print(tb())
    

    def on_resize(self, event):
        # Set canvas viewport and reconfigure visual transforms to match.
        vp = (0, 0, self.physical_size[0], self.physical_size[1])
        self.context.set_viewport(*vp)

        
    def create_line(self, pos1, pos2, color):
         
        try:
            x1, y1 = pos1
            x2, y2 = pos2
             
            V = np.zeros(2, [("position", np.float32, 3)])
            V["position"] = [[ x1, y1, 0], [x2, y2, 0]] 
                     
            vertices = VertexBuffer(V)
            indices = IndexBuffer([0, 1])
             
            program = gloo.Program(vertex_line, fragment_line)
            program.bind(vertices)
            model = translate((0, 0, 0))
            program['model'] = model
            r,g,b = color
            program['a_color'] = (r,g,b, 1)
             
            return program, indices
        except:
            print(tb())
             
             
    def gauss_window(self, n):
    
        values = []
        N = n - 1
        
        alpha = euler 
        
        v = lambda k: np.exp( -1/2 * ( alpha * (k - N/2) / (N/2) )**2 )
        
        zero_dif = v(0)
        
        for x in range(N):
            values.append ( v(x) - zero_dif)
            
        values.append(values[0])
                
        return values
    
    
    def setze_zoom_x(self, dx, pos_im_fenster):
         
        # Position Wave
        zoom_alt = self.program['zoom_x'][0]
        zoom_neu = max(1.0, zoom_alt * math_exp(2.5 * dx))
         
        anzahl_sichtbare = int(self.smpl_all / zoom_neu  ) 
        anzahl_sichtbare_alt = int(self.smpl_all / zoom_alt  )       
        dif_sichtbare = anzahl_sichtbare_alt - anzahl_sichtbare 
        
        nach_links = int(dif_sichtbare * pos_im_fenster) 
        nach_rechts = dif_sichtbare - nach_links        
        
        if zoom_neu == 1.0:
            self.sichtbare[0] = 0
            self.sichtbare[1] = self.smpl_all - 1
            self.drag_x = 0
            self.program['drag_x'] = 0
        else:
            self.sichtbare[0] += nach_links 
            self.sichtbare[1] -= nach_rechts 
        
        eigentliche_pos = -1 - ( -1 + 2.0 / self.smpl_all * self.sichtbare[0] )  * zoom_neu 

        self.program['versatz'] = eigentliche_pos 
        self.program['zoom_x'] = zoom_neu 


    def setze_positionslinie(self):
        
        x0, x1 = self.berechne_anfang_und_ende()
        zoom = self.program['zoom_x']
        versatz = self.program['versatz'][0]
        
        anzahl_sichtbare = int(self.smpl_all / zoom )
        
        if x0 <= self.pos_line <= x1:
            pos = self.pos_line - x0 
            pos_line_new = -1 + 2 * pos / float(anzahl_sichtbare)  
        else:
            # linie ausblenden
            pos_line_new = -2
         
        self.prg_poslinie['model'] = translate((pos_line_new, 0, 0))  
        
    
    def setze_markierungslinie(self, pos = None):
    
        x0, x1 = self.berechne_anfang_und_ende()
    
        if pos != None:
            dif = x1 - x0
            pos_but = runden(dif * pos) + x0
            self.pos_markline = pos_but
        
        zoom = self.program['zoom_x']
        anzahl_sichtbare = int(self.smpl_all / zoom )
         
        if x0 <= self.pos_markline <= x1:
            pos = self.pos_markline - x0
            pos_line_new = -1 + 2 * pos / float(anzahl_sichtbare)  
        else:
            # linie ausblenden
            pos_line_new = -2
        
        self.prg_marklinie['model'] = translate((pos_line_new, 0, 0))     
        self.update()
        
    
    def boost_color(self,*ev):
        self.program['boost'] = ev[0]**2 * .01
        print('boost color {0}'.format( ev[0]**2 * .01) )
        self.update()


    def change_point_size(self, *ev):
        self.program['point_size'] = ev[0]**1.2 / 100.
        print('point size {0:.3f}'.format( ev[0]**1.2 / 100.) )
        self.update()    
        
        
    def cut_displayed_values(self, *ev):
        self.program['cut_displayed_values'] = ev[0] / 100.
        print(u'cut {0} percent'.format( ev[0] ) )
        self.update()
        
         
    def berechne_anfang_und_ende(self):
        
        drag_x = self.program['drag_x']
        zoom = self.program['zoom_x']
        eigentliche_pos = self.program['versatz']
                        
        pos0 = -1. * zoom + drag_x * zoom + eigentliche_pos  
        pos1 = 1. * zoom + drag_x * zoom + eigentliche_pos 
        
        pos0 = pos0[0]
        pos1 = pos1[0]

        laenge = pos1 - pos0
        smpl_laenge = laenge / self.smpl_all 
        
        if pos0 <= -1:
            dif_links = abs(pos0 + 1)
            dif_rechts = pos1 - 1
        elif pos0 > -1:
            dif_links = -( pos0 + 1 )
            dif_rechts = pos1 - 1
            
        stelle_m1 = 100 / laenge * dif_links
        stelle_p1 = 100 - (100 / laenge * dif_rechts)
        x0 = runden(self.smpl_all * stelle_m1 / 100)
        x1 = runden(self.smpl_all * stelle_p1 / 100)
        
        return x0, x1
    
    
    def setze_xAchse(self):

        x0, x1 = self.berechne_anfang_und_ende()
                
        zoom_neu = self.program['zoom_x'][0]
        anzahl = int(self.smpl_all / zoom_neu  )
                 
        for w in self.anzeigewerte:
            teiler = anzahl / w
            if teiler > 2:
                break

        anfang = x0 / w + 1
        reihe = list(range(anfang * w, x1, w))
         
        positions = []
         
        for s in reihe:
            pos = s - x0
            positions.append([s,-1 + 2 * pos / float(anzahl) ])
     
        self.xAxis.positions = positions  
        self.xAxis.update()
    
         
    def on_draw(self, event):
        
        gloo.clear(color='grey')
        gloo.set_viewport(0, 0, *self.physical_size)
        
#         try:
#             gl.glEnable(gl.GL_BLEND)
#             gl.glEnable(GL.GL_POINT_SMOOTH)
# #             #gl.glBlendFunc (gl.GL_SRC_ALPHA, gl.GL_ONE_MINUS_SRC_ALPHA)
#             gl.glBlendFunc (gl.GL_SRC_ALPHA, gl. GL_ONE_MINUS_SRC_ALPHA) 
# #             gl.glBlendFunc (gl.GL_SRC_ALPHA, gl.GL_SRC_ALPHA)
# #              
# #             gl.glEnable(GL.GL_POINT_SPRITE)
# #             gl.glEnable(GL.GL_VERTEX_PROGRAM_POINT_SIZE)
#    
#         except Exception as e:
#             print(e)
        
                
        try:
            vp = (0, 0, self.physical_size[0], self.physical_size[1])
            self.context.set_viewport(*vp)
            self.program.draw('points')
            self.prg_poslinie.draw('lines', self.indices)
            self.prg_marklinie.draw('lines', self.indices2)

        except Exception as e:
            print(tb())
            #pd()




class Canvas_Live_Spectrogram(app.Canvas):
    
    def __init__(self, caller, smpl_all, buffer_size, xAxis, yAxis, info):
        app.Canvas.__init__(self, keys='interactive')
        
        try:
            self.caller = caller
            self.smpl_all = smpl_all
            self.buffer_size = buffer_size 
            self.xAxis= xAxis
            self.yAxis= yAxis
            
            self.buffer_counter = 0
            self.counter = 0
            self.freq = 22050
            self.fft_window_size = info['win']
            self.cut_freq = info['cut']
            
            ratio = self.cut_freq / float(self.freq)
            self.fft_window_size_spectro = ( int(self.fft_window_size * ratio) + int(self.fft_window_size * ratio) % 2 ) / 2
            
            self.ysl =  np.zeros((self.fft_window_size,), dtype=np.float32) 
            self.ysl_fft = {1:None}

            self.window2 = np.hanning(self.fft_window_size)
            self.window = self.gauss_window(self.fft_window_size)
            print(len(self.ysl), len(self.ysl))     
            self.last_mouse_position = None
            
            
            self.anzeigewerte = [b * 10**a for a in reversed(range(6)) for b in (4,2,1)]
            self.sichtbare = [0, smpl_all - 1]
            self.pos_line = 0
            self.pos_markline = 0
            
            self.is_scope = False
            self.display_values = 0
            
            benutzte_smpls = self.smpl_all / self.buffer_size
            all_verts =  benutzte_smpls * self.fft_window_size_spectro
            farbe = np.array(np.linspace(0,0, all_verts), ndmin=2).astype(np.float32)

            my_range_1 = [a * 2 * self.buffer_size  for a in range(benutzte_smpls) ]
            index_x = np.repeat(my_range_1, self.fft_window_size_spectro )

            my_range = [ y for y in range(self.fft_window_size_spectro) ]
            index_y = np.tile( my_range, benutzte_smpls)  
            
                   
            index = np.c_[np.fromiter(index_x, np.float32),
                          np.fromiter(index_y, np.float32),
                          ].astype(np.float32)
                                                          
             
            self.program = gloo.Program(VERT_SHADER_spectroGRAM, FRAG_SHADER_spectroGRAM)
            self.program['farbe'] = farbe

            self.program['color_bg'] = self.caller.spectro_color_bg
            self.program['color_fg'] = self.caller.spectro_color_fg
            
            self.program['index'] = index
            
            self.program['all_samples'] = smpl_all
            
            self.program['versatz'] = 0
            self.program['drag_x'] = 0
            self.program['drag_y'] = 0
            
            self.program['zoom_x'] = 1.
            self.program['zoom_y'] = 1.
            
            self.program['adjust_y'] = 1.
            self.program['boost'] = 1
            
            self.program['point_size'] = 1.
            self.program['maximum'] = 0.
            self.program['cut_displayed_values'] = 0.
            
            
            self.drag_x = 0
            self.drag_y = 0
            self.zoom_y = 1
            
            self.xAchse, self.indices0 = self.create_line([-.1, 0], [.1, 0], (.3, .3, .3))
            self.prg_poslinie, self.indices = self.create_line([0, -.1], [0, .1], (0, 1., 0.))
            self.prg_marklinie, self.indices2 = self.create_line([0, -.1], [0, .1], (0, 0., 1.))
            
            self.setze_xAchse()
                         
        except Exception as e:
            print(tb())
            #pd()
             
        
    def on_mouse_press(self, event):
        self.last_mouse_position = event.pos
        
        if event.button == 3:
            pos = float(event.pos[0]) / self.physical_size[0] 
            self.setze_markierungslinie(pos)
                        
                  
    def on_mouse_move(self, event):
        
        try:
            if event.is_dragging and event.buttons == [1]:

                dx =  event.pos[0] - self.last_mouse_position[0]
                relative_dx = float(dx) / self.physical_size[0] * 2 / self.program['zoom_x'][0]
                self.drag_x += relative_dx
                self.program['drag_x'] = self.drag_x
                
                self.setze_xAchse()
                self.setze_positionslinie()  
                self.setze_markierungslinie()
                
                self.update()
                self.last_mouse_position = event.pos
                
            elif event.is_dragging and event.buttons in( [1,2], [2,1] ):
                
                dy =  (event.pos[1] - self.last_mouse_position[1] ) 
                relative_dy = -float(dy) / self.physical_size[1] * 2 / self.program['zoom_y'][0]
                self.drag_y += relative_dy * self.zoom_y 
                self.program['drag_y'] = self.drag_y

                
                relative_dy = -float(dy) / self.physical_size[1]
                self.yAxis.drag_y -= relative_dy 
                self.yAxis.set_scale_y()
                self.yAxis.update()
                
                self.update()
                self.last_mouse_position = event.pos
                
            elif event.is_dragging and event.buttons == [2]:
                
                dy = event.pos[1] - self.last_mouse_position[1]
                self.zoom_y -= dy / 50. * self.zoom_y
                self.zoom_y = max(.0000001, self.zoom_y)
                self.program['zoom_y'] = self.zoom_y
                
                self.yAxis.zoom_y = self.zoom_y
                self.yAxis.set_scale_y()
                self.yAxis.update()

                self.update()
                self.last_mouse_position = event.pos
                
            elif event.is_dragging and event.buttons == [3]:
                pos = float(event.pos[0]) / self.physical_size[0] 
                
                modifiers = list([m.name for m in event.modifiers])

                if 'Control' in modifiers:
                    for a in range(self.caller.amount_scopes):
                        scope = self.caller.scopes[a]
                        scope.pos_markline = pos
                        scope.setze_markierungslinie(pos)
                        scope.update()                            
                else:
                    self.setze_markierungslinie(pos)
                    self.update()
                    
                self.last_mouse_position = event.pos
                
        except:
            print(tb())
    
    
    def on_mouse_wheel(self, event):
        
        try:
            modifiers = list([m.name for m in event.modifiers])

            if 'Control' in modifiers and 'Shift' in modifiers:
                self.widget.setFixedHeight(self.widget.height() + event.delta[1] * 2)
            else:
                dx = np.sign(event.delta[1]) * .05
                pos_im_fenster = ( event.pos[0] / float(self.physical_size[0]) )

                self.setze_zoom_x(dx, pos_im_fenster)
                self.setze_xAchse()
                self.setze_positionslinie()   
                self.setze_markierungslinie()        
                
            self.update()             
                         
        except Exception as e:
            print(tb())
    

    def on_resize(self, event):
        # Set canvas viewport and reconfigure visual transforms to match.
        vp = (0, 0, self.physical_size[0], self.physical_size[1])
        self.context.set_viewport(*vp)

        
    def create_line(self, pos1, pos2, color):
         
        try:
            x1, y1 = pos1
            x2, y2 = pos2
             
            V = np.zeros(2, [("position", np.float32, 3)])
            V["position"] = [[ x1, y1, 0], [x2, y2, 0]] 
                     
            vertices = VertexBuffer(V)
            indices = IndexBuffer([0, 1])
             
            program = gloo.Program(vertex_line, fragment_line)
            program.bind(vertices)
            model = translate((0, 0, 0))
            program['model'] = model
            r,g,b = color
            program['a_color'] = (r,g,b, 1)
             
            return program, indices
        except:
            print(tb())
             
             
    def gauss_window(self, n):
    
        values = []
        N = n - 1
        
        alpha = euler 
        
        v = lambda k: np.exp( -1/2 * ( alpha * (k - N/2) / (N/2) )**2 )
        
        zero_dif = v(0)
        
        for x in range(N):
            values.append ( v(x) - zero_dif)
            
        values.append(values[0])
                
        return values
    
    
    def setze_zoom_x(self, dx, pos_im_fenster):
         
        # Position Wave
        zoom_alt = self.program['zoom_x'][0]
        zoom_neu = max(1.0, zoom_alt * math_exp(2.5 * dx))
         
        anzahl_sichtbare = int(self.smpl_all / zoom_neu  ) 
        anzahl_sichtbare_alt = int(self.smpl_all / zoom_alt  )       
        dif_sichtbare = anzahl_sichtbare_alt - anzahl_sichtbare 
        
        nach_links = int(dif_sichtbare * pos_im_fenster) 
        nach_rechts = dif_sichtbare - nach_links        
        
        if zoom_neu == 1.0:
            self.sichtbare[0] = 0
            self.sichtbare[1] = self.smpl_all - 1
            self.drag_x = 0
            self.program['drag_x'] = 0
        else:
            self.sichtbare[0] += nach_links 
            self.sichtbare[1] -= nach_rechts 
        
        eigentliche_pos = -1 - ( -1 + 2.0 / self.smpl_all * self.sichtbare[0] )  * zoom_neu 

        self.program['versatz'] = eigentliche_pos 
        self.program['zoom_x'] = zoom_neu 


    def setze_positionslinie(self):
        
        x0, x1 = self.berechne_anfang_und_ende()
        zoom = self.program['zoom_x']
        versatz = self.program['versatz'][0]
        
        anzahl_sichtbare = int(self.smpl_all / zoom )
        
        if x0 <= self.pos_line <= x1:
            pos = self.pos_line - x0 
            pos_line_new = -1 + 2 * pos / float(anzahl_sichtbare)  
        else:
            # linie ausblenden
            pos_line_new = -2
         
        self.prg_poslinie['model'] = translate((pos_line_new, 0, 0))  
        
    
    def setze_markierungslinie(self, pos = None):
    
        x0, x1 = self.berechne_anfang_und_ende()
    
        if pos != None:
            dif = x1 - x0
            pos_but = runden(dif * pos) + x0
            self.pos_markline = pos_but
        
        zoom = self.program['zoom_x']
        anzahl_sichtbare = int(self.smpl_all / zoom )
         
        if x0 <= self.pos_markline <= x1:
            pos = self.pos_markline - x0
            pos_line_new = -1 + 2 * pos / float(anzahl_sichtbare)  
        else:
            # linie ausblenden
            pos_line_new = -2
        
        self.prg_marklinie['model'] = translate((pos_line_new, 0, 0))     
        self.update()
        
    
    def boost_color(self,*ev):
        self.program['boost'] = ev[0]**2 * .01
        print('boost color {0}'.format( ev[0]**2 * .01) )
        self.update()


    def change_point_size(self, *ev):
        self.program['point_size'] = ev[0]**1.2 / 100.
        print('point size {0:.3f}'.format( ev[0]**1.2 / 100.) )
        self.update()    
        
        
    def cut_displayed_values(self, *ev):
        self.program['cut_displayed_values'] = ev[0] / 100.
        print(u'cut {0} percent'.format( ev[0] ) )
        self.update()
        
         
    def berechne_anfang_und_ende(self):
        
        drag_x = self.program['drag_x']
        zoom = self.program['zoom_x']
        eigentliche_pos = self.program['versatz']
                        
        pos0 = -1. * zoom + drag_x * zoom + eigentliche_pos  
        pos1 = 1. * zoom + drag_x * zoom + eigentliche_pos 
        
        pos0 = pos0[0]
        pos1 = pos1[0]

        laenge = pos1 - pos0
        smpl_laenge = laenge / self.smpl_all 
        
        if pos0 <= -1:
            dif_links = abs(pos0 + 1)
            dif_rechts = pos1 - 1
        elif pos0 > -1:
            dif_links = -( pos0 + 1 )
            dif_rechts = pos1 - 1
            
        stelle_m1 = 100 / laenge * dif_links
        stelle_p1 = 100 - (100 / laenge * dif_rechts)
        x0 = runden(self.smpl_all * stelle_m1 / 100)
        x1 = runden(self.smpl_all * stelle_p1 / 100)
        
        return x0, x1
    
    
    def setze_xAchse(self):

        x0, x1 = self.berechne_anfang_und_ende()
                
        zoom_neu = self.program['zoom_x'][0]
        anzahl = int(self.smpl_all / zoom_neu  )
                 
        for w in self.anzeigewerte:
            teiler = anzahl / w
            if teiler > 2:
                break

        anfang = x0 / w + 1
        reihe = list(range(anfang * w, x1, w))
         
        positions = []
         
        for s in reihe:
            pos = s - x0
            positions.append([s,-1 + 2 * pos / float(anzahl) ])
     
        self.xAxis.positions = positions  
        self.xAxis.update()
    
         
    def on_draw(self, event):
        
        gloo.clear(color='grey')
        gloo.set_viewport(0, 0, *self.physical_size)
        
#         try:
#             gl.glEnable(gl.GL_BLEND)
#             gl.glEnable(GL.GL_POINT_SMOOTH)
# #             #gl.glBlendFunc (gl.GL_SRC_ALPHA, gl.GL_ONE_MINUS_SRC_ALPHA)
#             gl.glBlendFunc (gl.GL_SRC_ALPHA, gl. GL_ONE_MINUS_SRC_ALPHA) 
# #             gl.glBlendFunc (gl.GL_SRC_ALPHA, gl.GL_SRC_ALPHA)
# #              
# #             gl.glEnable(GL.GL_POINT_SPRITE)
# #             gl.glEnable(GL.GL_VERTEX_PROGRAM_POINT_SIZE)
#    
#         except Exception as e:
#             print(e)
        
                
        try:
            vp = (0, 0, self.physical_size[0], self.physical_size[1])
            self.context.set_viewport(*vp)
            self.program.draw('points')
            self.prg_poslinie.draw('lines', self.indices)
            self.prg_marklinie.draw('lines', self.indices2)

        except Exception as e:
            print(tb())
            #pd()






class Canvas_Scope(app.Canvas):
    
    def __init__(self, caller, smpl_all, xAxis, yAxis, scopes):
        app.Canvas.__init__(self, title='Glyphs', keys='interactive')
        
        try:
            self.caller = caller
            self.smpl_all = smpl_all
            self.xAxis= xAxis
            self.yAxis= yAxis
            self.scopes = scopes
            self.buffer_counter = 0
            self.counter = 0
            
            self.last_mouse_position = None
            
            self.anzeigewerte = [b * 10**a for a in reversed(range(6)) for b in (4,2,1)]
            self.sichtbare = [0, smpl_all - 1]
            self.pos_line = 0
            self.pos_markline = 0
            
            self.is_scope = True
             
            # Generate the signals as a (m, n) array.
            #self.y = np.array(np.linspace(-1, 1, smpl_all - 1),ndmin=2).astype(np.float32)
            self.y = np.array(np.linspace(0, 0, smpl_all - 1),ndmin=2).astype(np.float32)
     
            # Signal 2D index of each vertex (row and col) and x-index (sample index
            # within each signal).
            index = np.c_[np.repeat(0, smpl_all -1),
                          np.repeat(0, smpl_all-1),
                          np.arange(smpl_all-1)].astype(np.float32)
     
             
            self.program = gloo.Program(VERT_SHADER_SCOPE, FRAG_SHADER_SCOPE)
            self.program['position'] = self.y#.reshape(-1, 1)
            self.program['index'] = index
            self.program['color'] = self.caller.scope_color_fg
            
            self.program['all_samples'] = smpl_all
            
            self.program['versatz'] = 0
            self.program['drag_x'] = 0
            self.program['drag_y'] = 0
            
            self.program['zoom_x'] = 1.
            self.program['zoom_y'] = 1.
            
            self.program['adjust_y'] = 1.
            self.drag_x = 0
            self.drag_y = 0
            self.zoom_y = 1
            
            # X-Achse
            self.xAchse, self.indices0 = self.create_line([-.1, 0], [.1, 0], (.3, .3, .3))
            self.prg_poslinie, self.indices = self.create_line([0, -.1], [0, .1], (0, 1., 0.))
            self.prg_marklinie, self.indices2 = self.create_line([0, -.1], [0, .1], (0, 0., 1.))
                         
            self.setze_xAchse()

        except Exception as e:
            print(tb())
             
        
    def on_mouse_press(self, event):
        self.last_mouse_position = event.pos
        
        try:
            modifiers = list([m.name for m in event.modifiers])
        
            if event.button == 3 and 'Alt' in modifiers and self.caller.replay:
                pos = float(event.pos[0]) / self.physical_size[0] 
                x0, x1 = self.berechne_anfang_und_ende()
                dif = x1 - x0
                pos_but = runden(dif * pos) + x0
                self.caller.init_playback(self, pos_but)
            
            elif event.button == 3:
                pos = float(event.pos[0]) / self.physical_size[0] 
                self.setze_markierungslinie(pos)
        
        except Exception as e:
            print(tb())    
            #pd()       
                  
    def on_mouse_move(self, event):
        
        try:
            if event.is_dragging and event.buttons == [1]:

                dx =  event.pos[0] - self.last_mouse_position[0]
                relative_dx = float(dx) / self.physical_size[0] * 2 / self.program['zoom_x'][0]
                self.drag_x += relative_dx
                self.program['drag_x'] = self.drag_x
                
                self.setze_xAchse()
                self.setze_positionslinie()  
                self.setze_markierungslinie()
                
                self.update()
                self.last_mouse_position = event.pos
                
            elif event.is_dragging and event.buttons in( [1,2], [2,1] ):
                
                dy =  event.pos[1] - self.last_mouse_position[1] 
                relative_dy = -float(dy) / self.physical_size[1] * 2 / self.program['zoom_y'][0]
                self.drag_y += relative_dy * self.zoom_y 
                self.program['drag_y'] = self.drag_y

                model = translate((0, self.drag_y, 0))
                self.xAchse['model'] = model
                
                self.yAxis.drag_y -= relative_dy / self.program['adjust_y'][0] * self.zoom_y 
                self.yAxis.set_scale_y()
                self.yAxis.update()
                
                self.update()
                self.last_mouse_position = event.pos
                
            elif event.is_dragging and event.buttons == [2]:
                
                dy = event.pos[1] - self.last_mouse_position[1]
                self.zoom_y -= dy / 50. #* self.zoom_y
                self.zoom_y = max(.0000001, self.zoom_y)
                self.program['zoom_y'] = self.zoom_y
                
                self.yAxis.zoom_y = self.zoom_y
                self.yAxis.set_scale_y()
                self.yAxis.update()

                self.update()
                self.last_mouse_position = event.pos
                
            elif event.is_dragging and event.buttons == [3]:
                pos = float(event.pos[0]) / self.physical_size[0] 
                
                modifiers = list([m.name for m in event.modifiers])

                if 'Control' in modifiers:
                    for a in range(self.caller.amount_scopes):
                        scope = self.caller.scopes[a]
                        scope.pos_markline = pos
                        scope.setze_markierungslinie(pos)
                        scope.update()                            
                else:
                    self.setze_markierungslinie(pos)
                    self.update()
                    
                self.last_mouse_position = event.pos
                
        except:
            print(tb())


    def on_resize(self, event):
        # Set canvas viewport and reconfigure visual transforms to match.
        vp = (0, 0, self.physical_size[0], self.physical_size[1])
        self.context.set_viewport(*vp)

        
    def create_line(self, pos1, pos2, color):
         
        try:
            x1, y1 = pos1
            x2, y2 = pos2
             
            V = np.zeros(2, [("position", np.float32, 3)])
            V["position"] = [[ x1, y1, 0], [x2, y2, 0]] 
                     
            vertices = VertexBuffer(V)
            indices = IndexBuffer([0, 1])
             
            program = gloo.Program(vertex_line, fragment_line)
            program.bind(vertices)
            model = translate((0, 0, 0))
            program['model'] = model
            r,g,b = color
            program['a_color'] = (r,g,b, 1)
             
            return program, indices
        except:
            print(tb())
       
 
    def on_mouse_wheel(self, event):
        
        try:
            modifiers = list([m.name for m in event.modifiers])

            if 'Control' in modifiers and 'Shift' in modifiers:
                self.widget.setFixedHeight(self.widget.height() + event.delta[1] * 2)
            else:
                dx = np.sign(event.delta[1]) * .05
                pos_im_fenster = ( event.pos[0] / float(self.physical_size[0]) )
    
                self.setze_zoom_x(dx, pos_im_fenster)
                self.setze_xAchse() 
                self.setze_positionslinie()   
                self.setze_markierungslinie()        
            
            self.update()             
                         
        except Exception as e:
            print(tb())
             

    def setze_zoom_x(self, dx, pos_im_fenster):
         
        # Position Wave
        zoom_alt = self.program['zoom_x'][0]
        zoom_neu = max(1.0, zoom_alt * math_exp(2.5 * dx))
         
        anzahl_sichtbare = int(self.smpl_all / zoom_neu  ) 
        anzahl_sichtbare_alt = int(self.smpl_all / zoom_alt  )       
        dif_sichtbare = anzahl_sichtbare_alt - anzahl_sichtbare 
        
        nach_links = int(dif_sichtbare * pos_im_fenster) 
        nach_rechts = dif_sichtbare - nach_links        
        
        if zoom_neu == 1.0:
            self.sichtbare[0] = 0
            self.sichtbare[1] = self.smpl_all - 1
            self.drag_x = 0
            #self.drag_y = 0
            #self.zoom_y = 1
            self.program['drag_x'] = 0
        else:
            self.sichtbare[0] += nach_links 
            self.sichtbare[1] -= nach_rechts 
        
        eigentliche_pos = -1 - ( -1 + 2.0 / self.smpl_all * self.sichtbare[0] )  * zoom_neu 

        self.program['versatz'] = eigentliche_pos 
        self.program['zoom_x'] = zoom_neu 


    def setze_positionslinie(self):
        
        x0, x1 = self.berechne_anfang_und_ende()
        zoom = self.program['zoom_x']
        versatz = self.program['versatz'][0]
        
        anzahl_sichtbare = int(self.smpl_all / zoom )
        
        if x0 <= self.pos_line <= x1:
            pos = self.pos_line - x0 
            pos_line_new = -1 + 2 * pos / float(anzahl_sichtbare)  
        else:
            # Positionslinie ausblenden
            pos_line_new = -2
         
        self.prg_poslinie['model'] = translate((pos_line_new, 0, 0))  
        
    
    def setze_markierungslinie(self, pos = None):
    
        x0, x1 = self.berechne_anfang_und_ende()
    
        if pos != None:
            dif = x1 - x0
            pos_but = runden(dif * pos) + x0
            self.pos_markline = pos_but
        
        zoom = self.program['zoom_x']
        anzahl_sichtbare = int(self.smpl_all / zoom )
         
        if x0 <= self.pos_markline <= x1:
            pos = self.pos_markline - x0
            pos_line_new = -1 + 2 * pos / float(anzahl_sichtbare)  
        else:
            # Positionslinie ausblenden
            pos_line_new = -2
        
        self.prg_marklinie['model'] = translate((pos_line_new, 0, 0))     
        self.update()
        
          
    def berechne_anfang_und_ende(self):
        
        drag_x = self.program['drag_x']
        zoom = self.program['zoom_x']
        eigentliche_pos = self.program['versatz']
                        
        pos0 = -1. * zoom + drag_x * zoom + eigentliche_pos  
        pos1 = 1. * zoom + drag_x * zoom + eigentliche_pos 
        
        pos0 = pos0[0]
        pos1 = pos1[0]

        laenge = pos1 - pos0
        smpl_laenge = laenge / self.smpl_all 
        
        if pos0 <= -1:
            dif_links = abs(pos0 + 1)
            dif_rechts = pos1 - 1
        elif pos0 > -1:
            dif_links = -( pos0 + 1 )
            dif_rechts = pos1 - 1
            
        stelle_m1 = 100 / laenge * dif_links
        stelle_p1 = 100 - (100 / laenge * dif_rechts)
        x0 = runden(self.smpl_all * stelle_m1 / 100)
        x1 = runden(self.smpl_all * stelle_p1 / 100)
        
        return x0, x1
    
         
    def setze_xAchse(self):

        x0, x1 = self.berechne_anfang_und_ende()
                
        zoom_neu = self.program['zoom_x'][0]
        anzahl = int(self.smpl_all / zoom_neu  )
                 
        for w in self.anzeigewerte:
            teiler = anzahl / w
            if teiler > 2:
                break

        anfang = x0 / w + 1
        reihe = list(range(anfang * w, x1, w))
         
        positions = []
         
        for s in reihe:
            pos = s - x0
            positions.append([s,-1 + 2 * pos / float(anzahl) ])
     
        self.xAxis.positions = positions  
        self.xAxis.update()

    
    def on_draw(self, event):
        
        gloo.clear(color = self.caller.scope_color_bg)
        gloo.set_viewport(0, 0, *self.physical_size)
                
        try:
            vp = (0, 0, self.physical_size[0], self.physical_size[1])
            self.context.set_viewport(*vp)
            
            self.xAchse.draw('lines', self.indices0)
            self.program.draw('line_strip') #'points'
            self.prg_poslinie.draw('lines', self.indices)
            self.prg_marklinie.draw('lines', self.indices2)

        except Exception as e:
            print(tb())
            #pd()

class XAxis(QtGui.QWidget):
    
    def __init__(self):
        super(XAxis, self).__init__()
        
        self.qp = QtGui.QPainter()
        self.metrics = QtGui.QFontMetrics(QtGui.QFont('Decorative', 10))
        self.setContentsMargins(0, 0, 0, 0)
        self.positions = []
           

    def paintEvent(self, event):

        self.qp.begin(self)
        self.qp.setPen(QtGui.QColor(200,200,200))
        self.qp.setFont(QtGui.QFont('Decorative', 10))
        
        r = event.rect()
        rect_x = r.width()
        
        self.qp.drawLine(0,0,rect_x,0)
        
        for txt,pos in self.positions:
            
            txt = str(txt)
            width = self.metrics.width(txt)
            
            x1 = int( (1 + pos) / 2 * rect_x) 
            x = x1 - int(width/2.)
            
            rect = QtCore.QRect(x,8,width,13)
            
            self.qp.drawText(rect, QtCore.Qt.AlignLeft, txt) 
            self.qp.drawLine(x1,0,x1,5) 
            
        self.qp.end()   
                            
            
class YAxis_spectrogram(QtGui.QWidget):
    
    def __init__(self, scope):
        super(YAxis_spectrogram, self).__init__()

        self.positions = []
        self.spectro = None
        
        self.anzahl_y_Werte = 9
        
        self.max_y = 1
        self.min_y = -1
        
        self.drag_y = 0
        self.zoom_y = 1
        
        self.font_size = 10.
        
        self.qp = QtGui.QPainter()
        self.metrics = QtGui.QFontMetrics(QtGui.QFont('Decorative', self.font_size))
        

    def paintEvent(self, event):

        self.qp.begin(self)
        self.qp.setPen(QtGui.QColor(200,200,200))
        self.qp.setFont(QtGui.QFont('Decorative', 10))
        
        r = event.rect()
        width = r.width()
        height = r.height()
        
        self.qp.drawLine(width - 1, 0, width - 1, height)
        
        for txt,pos in self.positions:
            
            txt = str(txt)

            txt_height = self.metrics.height()
            txt_width = self.metrics.width(txt)
             
            y = int( (1 + -pos) / 2 * height) 
            y1 = y - int(txt_height / 2.)
             
            rect = QtCore.QRect(width - txt_width - 7, y1, txt_width, y1)
            
            self.qp.drawText(rect, QtCore.Qt.AlignLeft, txt) 
            self.qp.drawLine(width - 5, y , width, y) 
            
        self.qp.end()   
    
    
    def set_scale_y(self):
        self.positions, null_pos = berechne_abstaende_y_Achse2(self.spectro.fft_window_size, -self.drag_y, 
                                                               self.zoom_y, self.spectro.cut_freq)    


class YAxis_Scope(QtGui.QWidget):
    
    def __init__(self):
        super(YAxis_Scope, self).__init__()

        self.positions = []
        
        self.anzahl_y_Werte = 9
        
        self.max_y = 1
        self.min_y = -1
        
        self.drag_y = 0
        self.zoom_y = 1
        
        self.font_size = 10.
        
        self.qp = QtGui.QPainter()
        self.metrics = QtGui.QFontMetrics(QtGui.QFont('Decorative', self.font_size))
        

    def paintEvent(self, event):

        self.qp.begin(self)
        self.qp.setPen(QtGui.QColor(200,200,200))
        self.qp.setFont(QtGui.QFont('Decorative', 10))
        
        r = event.rect()
        width = r.width()
        height = r.height()
        
        self.qp.drawLine(width - 1, 0, width - 1, height)
        
        for txt,pos in self.positions:
            
            txt = str(txt)

            txt_height = self.metrics.height()
            txt_width = self.metrics.width(txt)
             
            y = int( (1 + -pos) / 2 * height) 
            y1 = y - int(txt_height / 2.)
             
            rect = QtCore.QRect(width - txt_width - 7, y1, txt_width, y1)
            
            self.qp.drawText(rect, QtCore.Qt.AlignLeft, txt) 
            self.qp.drawLine(width - 5, y , width, y) 
            
        self.qp.end()   
    
    
    def set_scale_y(self):

        maxi = (self.max_y + self.drag_y) / self.zoom_y
        mini = (self.min_y + self.drag_y) / self.zoom_y
          
        self.positions, null_pos = berechne_abstaende_y_Achse(maxi, mini)  


def runden(x):
    dif = x - int(x)
    if dif >= .5:
        return int(x) + 1
    else:
        return int(x)


def pr(locs,*args):
    print('')
    for a in args:
        print('{0}: {1}'.format(a,locs[a]))



from decimal import Decimal as D  
def berechne_abstaende_y_Achse(maxi, mini):
    
    laenge = float(maxi - mini)
    vor, nach = str(laenge).split('.')
    
    if laenge == 0:
        return  [[1.,1.], [0., 0.], [-1., -1.]], 0.
    
    if int(vor) != 0:
        dezi = 10**( len(vor) -1)
    else:
        d = 0
        while nach[d] == '0':
            d += 1

        dezi = 1. / 10**(d + 1)
    
    
    anzahl = laenge / dezi
    if anzahl > 9:
        dezi *= 2
        anzahl = laenge / dezi
    
    if anzahl < 2:
        dezi /= 2.
        anzahl = laenge / dezi
    
    groesser0 = []
    kleiner0 = []
    positionen = []
    
    x = 1
    while dezi * x < maxi:
        v = D(str(dezi)) * D(str(x))
        groesser0.append(v)
        x += 1
    
    x = 1
    while dezi * -x > mini:
        v = D(str(dezi)) * D(str(-x))
        kleiner0.append(v)
        x += 1
    
    reihe = list(reversed(groesser0)) + [0] + kleiner0
    
    for r in reihe:
        rel_pos = - 1 + 2. / laenge * (float(r) - mini)
        positionen.append([r, rel_pos])
        if r == 0:
            null_pos = rel_pos 
    
    return positionen, null_pos
        

def berechne_abstaende_y_Achse2(fft_window_size, drag_y, zoom_y, cut_freq ):
    
    freq_sichtbar = cut_freq / zoom_y
    verschoben = freq_sichtbar * drag_y
    
    maxi = freq_sichtbar - verschoben
    mini = -verschoben
    
    return berechne_abstaende_y_Achse(maxi, mini)
    
    
    

