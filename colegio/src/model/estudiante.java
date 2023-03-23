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
public class estudiante extends  persona{
    
    private List<Integer>cursosmatricula = new ArrayList<>();
    public void setCursosmatricula(List<Integer>cursomatricula){
        this.cursosmatricula = cursosmatricula;
    }
     public List<Integer> getCursosmatricula(){
         return cursosmatricula;
     }

   
         
         
        
    
}
