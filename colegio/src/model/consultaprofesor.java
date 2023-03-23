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
public class consultaprofesor {

    private List<Integer> cursomatriculado;

    public boolean matricularcurso(int codigo, profesor profesor) {
        try {
            cursomatriculado = profesor.getCursomatriculado();
            for (int i = 0; i < cursomatriculado.size(); i++) {
                if (cursomatriculado.get(i) == codigo) {
                    return false;
                }
            }
            cursomatriculado.add(codigo);
            profesor.setCursomatriculado(cursomatriculado);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean eliminarmatriculacurso(int codigoanterior, int codigoactual, profesor profesor) {
        try {
            cursomatriculado = profesor.getCursomatriculado();
            for (int i = 0; i < cursomatriculado.size(); i++) {
                if (cursomatriculado.get(i) == codigoanterior) {
                    cursomatriculado.set(i, codigoactual);
                    profesor.setCursomatriculado(cursomatriculado);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean eliminarmatriculacurso(int codigo, profesor profesor) {
        try {
            cursomatriculado = profesor.getCursomatriculado();
            for (int i = 0; i < cursomatriculado.size(); i++) {
                if (cursomatriculado.get(i) == codigo) {
                    cursomatriculado.remove(i);
                    profesor.setCursomatriculado(cursomatriculado);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

}
