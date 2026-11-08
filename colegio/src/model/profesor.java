/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package model;

import java.util.List;

/**
 *
 * @author LENOVO
 */
public class profesor extends persona{
    
    private List<Integer> cursomatriculado = new java.util.ArrayList<>();

    public void setCursomatriculado(List<Integer> cursomatriculado) {
        this.cursomatriculado = cursomatriculado;
    }

    public List<Integer> getCursomatriculado() {
        return cursomatriculado;
    }
}
