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
public class profesor extends persona{
    
    private List<Integer>cursomatriculado=new ArrayList<>();

    public void setCursomatriculado(List<Integer> cursomatriculado) {
        this.cursomatriculado = cursomatriculado;
    }

    public List<Integer> getCursomatriculado() {
        return cursomatriculado;
    }
    
    public static List<clasecurso> cursosimparte= new ArrayList<>();
    
    public boolean agreagarcurso(int codigo ){
        for(clasecurso curso : cursosimparte){
            if(curso.getCodigo().equals(codigo)){
            cursosimparte.set(codigo, curso);
        }
      }
        return false;
    }
    
    public boolean editarcurso(int codigo, int codigoanterior){
        for (clasecurso curso : cursosimparte) {
            if(curso.getCodigo().equals(codigoanterior)){
                cursosimparte.set(codigo, curso);
            }
        }
        return false;
    }
    
    public boolean eliminarcurso(int codigo){
        for (clasecurso curso : cursosimparte) {
            if(curso.getCodigo().equals(codigo)){
                cursosimparte.remove(curso);
                return true;
            }
        }
        return false;
    }
}
