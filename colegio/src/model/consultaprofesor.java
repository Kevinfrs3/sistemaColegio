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
public class consultaprofesor {

    public static final List<profesor> listaprofesor = new ArrayList<>();
    private final consultacurso consultaCurso = new consultacurso();

    public boolean agregarProfesor(String identificacion, String nombre, String apellido, int edad) {
        if (identificacion == null || !identificacion.matches("\\d+") || nombre == null
                || !nombre.trim().matches("[\\p{L}\\s'-]+") || apellido == null
                || !apellido.trim().matches("[\\p{L}\\s'-]+") || edad < 0 || edad > 99
                || buscarProfesor(identificacion) != null) {
            return false;
        }
        profesor nuevoProfesor = new profesor();
        nuevoProfesor.setIdentificacion(identificacion.trim());
        nuevoProfesor.setNombre(nombre.trim());
        nuevoProfesor.setApellido(apellido.trim());
        nuevoProfesor.setEdad(edad);
        listaprofesor.add(nuevoProfesor);
        return true;
    }

    public boolean editarProfesor(String identificacion, String nombre, String apellido, int edad) {
        profesor existente = buscarProfesor(identificacion);
        if (existente == null || nombre == null || !nombre.trim().matches("[\\p{L}\\s'-]+")
                || apellido == null || !apellido.trim().matches("[\\p{L}\\s'-]+")
                || edad < 0 || edad > 99) {
            return false;
        }
        existente.setNombre(nombre.trim());
        existente.setApellido(apellido.trim());
        existente.setEdad(edad);
        return true;
    }

    public boolean eliminarProfesor(String identificacion) {
        profesor existente = buscarProfesor(identificacion);
        return existente != null && listaprofesor.remove(existente);
    }

    public profesor buscarProfesor(String identificacion) {
        if (identificacion == null) {
            return null;
        }
        for (profesor existente : listaprofesor) {
            if (existente.getIdentificacion().equalsIgnoreCase(identificacion.trim())) {
                return existente;
            }
        }
        return null;
    }

    public List<profesor> consultarProfesores() {
        return new ArrayList<>(listaprofesor);
    }

    public boolean matricularcurso(int codigo, profesor profesor) {
        if (profesor == null || consultaCurso.buscarCurso(codigo) == null
                || profesor.getCursomatriculado().contains(codigo)) {
            return false;
        }
        for (profesor existente : listaprofesor) {
            if (existente != profesor && existente.getCursomatriculado().contains(codigo)) {
                return false;
            }
        }
        profesor.getCursomatriculado().add(codigo);
        return true;
    }

    public boolean eliminarmatriculacurso(int codigoanterior, int codigoactual, profesor profesor) {
        if (profesor == null || consultaCurso.buscarCurso(codigoactual) == null
                || profesor.getCursomatriculado().contains(codigoactual)) {
            return false;
        }
        int indice = profesor.getCursomatriculado().indexOf(codigoanterior);
        if (indice < 0) {
            return false;
        }
        profesor.getCursomatriculado().set(indice, codigoactual);
        return true;
    }

    public boolean eliminarmatriculacurso(int codigo, profesor profesor) {
        if (profesor == null) {
            return false;
        }
        return profesor.getCursomatriculado().remove(Integer.valueOf(codigo));
    }

}
