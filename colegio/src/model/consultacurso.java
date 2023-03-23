/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author LENOVO
 */
public class consultacurso {

    public static List<curso> listacurso = new ArrayList<>();

    public boolean agregarcurso(int codigo, String nombre) {

        curso curso0 = new curso();
        curso0.setCodigo(codigo);
        curso0.setNombre(nombre);
        listacurso.add(curso0);
        return true;
    }

    public boolean editarcurso(int codigo, String nombre) {
        curso curso0 = null;
        int indice = -1;
        for (int i = 1; i < listacurso.size(); i++) {
            if (listacurso.get(i).getCodigo() == codigo) {
                curso0 = listacurso.get(i);
                indice = i;
            }
        }
        if (curso0 != null) {
            curso0.setCodigo(codigo);
            curso0.setNombre(nombre);
            listacurso.set(indice, curso0);
            return true;
        } else {
            return false;
        }
    }

    public boolean eliminarcurso(int codigo) {
        for (int i = 0; i < listacurso.size(); i++) {
            if (listacurso.get(i).getCodigo() == codigo) {
                listacurso.remove(i);
                return true;
            }
        }
        return false;
    }
    
    public List<curso>consularlistacurso(){
        return listacurso;
    }
    
    public curso consulacursocodigo(int codigo, String nombre){
        for (int i=0;i<listacurso.size();i++){
            if(listacurso.get(i).getCodigo()==codigo){
                return listacurso.get(i);
            }
        }
        return null;
    }

}
